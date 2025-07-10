import { User } from '../../models/User';
import { ObjectId } from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      user?: User & { id?: string | ObjectId };
    }
  }
}
