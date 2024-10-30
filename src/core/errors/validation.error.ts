import { StatusCodes } from 'http-status-codes';
import { IErrorResponse } from 'src/core/interfaces';
import AppError from './app.error';

export default class ValidationError extends AppError {
  statusCode: number;

  defaultErrorMessage: string = 'Validation Error';

  constructor(message: string, errResponse?: IErrorResponse) {
    super(message, errResponse);
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.name = 'ValidationError';
  }
}
