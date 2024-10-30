import { StatusCodes } from 'http-status-codes';
import { IErrorResponse } from 'src/core/interfaces';
import AppError from './app.error';

export default class NotFoundError extends AppError {
  statusCode: number;

  defaultErrorMessage: string = 'Not found.';

  constructor(message: string, errResponse?: IErrorResponse) {
    super(message, errResponse);
    this.statusCode = StatusCodes.NOT_FOUND;
    this.name = 'NotFoundError';
  }
}
