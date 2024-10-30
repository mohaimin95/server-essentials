import { IAuthRequest, IController } from 'src/core/interfaces';
import { NextFunction, Request, Response } from 'express';

type Controller = (
  _req: Request | IAuthRequest,
  _res: Response,
  _next: NextFunction,
) => IController | Promise<IController>;

export default Controller;
