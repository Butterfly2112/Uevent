import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    login: string;
    username: string;
    email: string;
    role: string;
  };
}
