import { Request, Response, NextFunction } from 'express';
import mongoose, { Document, Model, Types } from 'mongoose';
import { AppError, catchAsync } from '../utils/errorHandler';

// Removed custom IDocument interface; use Mongoose Document or natural types.

// Interface for the controller options
interface ICrudControllerOptions {
  ownerField?: string;
  populateFields?: string | string[];
  selectFields?: string;
  sortBy?: string;
  limit?: number;
}

// Generic D = Document shape, M = Model<D>
export class CrudController<D extends Document = Document, M extends Model<D> = Model<D>> {
  private model: M;
  private resourceName: string;
  private options: ICrudControllerOptions = {
    ownerField: 'owner',
    populateFields: undefined,
    selectFields: undefined,
    sortBy: undefined,
    limit: 100
  };

  constructor(model: M, resourceName: string, options: Partial<ICrudControllerOptions> = {}) {
    this.model = model;
    this.resourceName = resourceName;
    this.options = { ...this.options, ...options };
  }

  // Create a new resource
  create = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const data = req.body[this.resourceName] || req.body;
    if (!data) {
      throw new AppError(`${this.resourceName} data is required`, 400);
    }

    // Set owner if ownerField is specified
    if (this.options.ownerField) {
      data[this.options.ownerField] = req.user.id;
    }

    const newItem = await this.model.create(data);

    // If this is a user's resource, add it to their document
    if (['character', 'campaign'].includes(this.resourceName)) {
      await mongoose.model('User').findByIdAndUpdate(
        req.user.id,
        { $addToSet: { [`${this.resourceName}s`]: newItem._id } },
        { new: true, runValidators: true }
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        [this.resourceName]: newItem
      }
    });
  });

  // Get all resources (optionally filtered by owner)
  getAll = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 2) Add owner filter if ownerField is specified
    if (this.options.ownerField) {
      // Type assertion to any for dynamic schemas
      (queryObj as any)[this.options.ownerField] = req.user.id;
    }

    // 2.5) Advanced filtering (gt, gte, lt, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = this.model.find(JSON.parse(queryStr));

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else if (this.options.sortBy) {
      query = query.sort(this.options.sortBy);
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else if (this.options.selectFields) {
      query = query.select(this.options.selectFields);
    }

    // 5) Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || this.options.limit || 100;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numItems = await this.model.countDocuments(query.getQuery());
      if (skip >= numItems) throw new AppError('This page does not exist', 404);
    }

    query = query.skip(skip).limit(limit);

    // 6) Populate
    if (this.options.populateFields) {
      const populateOptions = Array.isArray(this.options.populateFields)
        ? this.options.populateFields.join(' ')
        : this.options.populateFields;
      query = query.populate(populateOptions);
    }

    // EXECUTE QUERY
    const items = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        [this.resourceName]: items
      }
    });
  });

  // Get a single resource by ID
  getById = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    let query = this.model.findById(req.params.id);

    if (this.options.populateFields) {
      const populateOptions = Array.isArray(this.options.populateFields)
        ? this.options.populateFields.join(' ')
        : this.options.populateFields;
      query = query.populate(populateOptions);
    }

    const item = await query;

    if (!item) {
      throw new AppError(`${this.resourceName} not found`, 404);
    }

    // Check ownership if ownerField is specified
    // Use type assertion for dynamic property access
    if (this.options.ownerField && (item as any)[this.options.ownerField]?.toString() !== req.user.id) {
      throw new AppError('Not authorized to access this resource', 403);
    }

    res.status(200).json({
      status: 'success',
      data: {
        [this.resourceName]: item
      }
    });
  });

  // Update a resource
  update = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const updates = req.body[this.resourceName] || req.body;

    if (!updates || Object.keys(updates).length === 0) {
      throw new AppError('Update data is required', 400);
    }

    // Don't allow changing the owner
    if ((updates as any)[this.options.ownerField as string]) {
      delete (updates as any)[this.options.ownerField as string];
    }

    // First check if the resource exists and user has permission
    const existingItem = await this.model.findById(req.params.id);
    if (!existingItem) {
      throw new AppError(`${this.resourceName} not found`, 404);
    }

    if (this.options.ownerField &&
      ((existingItem as any)[this.options.ownerField]?.toString() !== req.user.id)) {
      throw new AppError('Not authorized to update this resource', 403);
    }

    // Then perform the update
    const item = await this.model.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!item) {
      throw new AppError(`${this.resourceName} not found`, 404);
    }

    // Refresh the document to get populated fields
    const updatedItem = await this.model.findById(item._id);

    res.status(200).json({
      status: 'success',
      data: {
        [this.resourceName]: updatedItem
      }
    });
  });

  // Delete a resource
  delete = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const item = await this.model.findById(req.params.id);

    if (!item) {
      throw new AppError(`${this.resourceName} not found`, 404);
    }

    // Check ownership if ownerField is specified
    // Use type assertion for dynamic property access
    if (this.options.ownerField && (item as any)[this.options.ownerField]?.toString() !== req.user.id) {
      throw new AppError('Not authorized to delete this resource', 403);
    }

    // Use a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await item.deleteOne({ session });

      // If this is a user's resource, remove it from their document
      if (['character', 'campaign'].includes(this.resourceName)) {
        await mongoose.model('User').findByIdAndUpdate(
          req.user.id,
          { $pull: { [`${this.resourceName}s`]: item._id } },
          { session }
        );
      }

      await session.commitTransaction();

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });

  // Middleware to check resource ownership
  checkOwnership = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const item = await this.model.findById(req.params.id);

    if (!item) {
      throw new AppError(`${this.resourceName} not found`, 404);
    }

    if (this.options.ownerField && item[this.options.ownerField].toString() !== req.user.id) {
      throw new AppError('Not authorized to access this resource', 403);
    }

    // Attach the resource to the request object for use in subsequent middleware
    req.resource = item;
    next();
  });

  // Middleware to validate ObjectId
  validateObjectId = (req: Request, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError('Invalid ID format', 400));
    }
    next();
  };
}

export default CrudController;
