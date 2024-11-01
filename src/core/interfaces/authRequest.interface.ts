import { Request } from 'express';
import { IDecryptedToken } from 'src/core/interfaces';

export default interface IAuthRequest extends Request {
  user?: IDecryptedToken;
  userType?: string;
  isAdmin?: boolean;
  tokenErr?: Error;
}
