import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to validate that a MongoDB ObjectId parameter exists and is valid
 * @param paramName The name of the parameter to validate (from req.params, req.query, or req.body)
 * @param source Where to look for the parameter ('params', 'query', or 'body')
 */
export function validateObjectId(paramName: string, source: 'params' | 'query' | 'body' = 'params'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    let id: any;
    if (source === 'params') id = req.params[paramName];
    else if (source === 'query') id = req.query[paramName];
    else id = req.body[paramName];

    if (!id) {
      res.status(400).json({ message: `${paramName} is required` });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: `Invalid ${paramName} format` });
      return;
    }
    next();
  };
}
