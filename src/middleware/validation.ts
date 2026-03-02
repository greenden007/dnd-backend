import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

type SchemaType<T> = z.ZodType<T>;

export const validate = <T>(schema: SchemaType<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, and params against the schema
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const validationError = fromZodError(result.error as any);
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation Error',
            details: validationError.details,
          },
        });
      }

      // Attach validated data to the request object
      req.validatedData = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error during validation',
        },
      });
    }
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
  }),

  register: z.object({
    body: z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      email: z.string().email('Invalid email format'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
    }),
  }),

  // Character schemas
  createCharacter: z.object({
    body: z.object({
      name: z.string().min(1, 'Name is required'),
      race: z.string().min(1, 'Race is required'),
      class: z.string().min(1, 'Class is required'),
      level: z.number().int().min(1).max(20, 'Level must be between 1 and 20'),
      abilities: z.object({
        strength: z.number().int().min(1).max(30),
        dexterity: z.number().int().min(1).max(30),
        constitution: z.number().int().min(1).max(30),
        intelligence: z.number().int().min(1).max(30),
        wisdom: z.number().int().min(1).max(30),
        charisma: z.number().int().min(1).max(30),
      }),
    }),
  }),

  // Generic ID parameter validation
  idParam: z.object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    }),
  }),

  // Pagination query params
  pagination: z.object({
    query: z.object({
      page: z.preprocess(
        (val) => parseInt(String(val), 10) || 1,
        z.number().int().min(1, 'Page must be a positive integer'),
      ),
      limit: z.preprocess(
        (val) => parseInt(String(val), 10) || 10,
        z.number().int().min(1, 'Limit must be a positive integer').max(100, 'Maximum limit is 100'),
      ),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
    }),
  }),

  // Password reset schemas
  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        ),
    }),
  }),
};

// Extend Express Request type to include validatedData
declare global {
  namespace Express {
    interface Request {
      validatedData?: unknown;
    }
  }
}
