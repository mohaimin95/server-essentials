import { StatusCodes } from 'http-status-codes';
import { IErrorResponse } from 'src/core/interfaces';
import AppError from './app.error';

export default class ConflictError extends AppError {
  statusCode: number;

  defaultErrorMessage: string = 'Resource already exists.';

  constructor(message: string, errResponse?: IErrorResponse) {
    super(message, errResponse);
    this.statusCode = StatusCodes.CONFLICT;
    this.name = 'ConflictError';
  }
}
