import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: Types.ObjectId;
      email: string;
      username: string;
      // Add other user properties as needed
    }

    interface Request {
      user?: User;
      resource?: any; // For resources loaded by middleware
    }
  }
}
