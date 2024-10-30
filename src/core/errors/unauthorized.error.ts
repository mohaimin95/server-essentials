import { StatusCodes } from 'http-status-codes';
import { IErrorResponse } from 'src/core/interfaces';
import AppError from './app.error';

export default class UnauthorizedError extends AppError {
  statusCode: number;

  defaultErrorMessage: string = 'Unauthorized request.';

  constructor(message: string, errResponse?: IErrorResponse) {
    super(message, errResponse);
    this.statusCode = StatusCodes.UNAUTHORIZED;
    this.name = 'UnauthorizedError';
  }
}
