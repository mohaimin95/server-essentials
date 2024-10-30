import { StatusCodes } from 'http-status-codes';
import { IErrorResponse } from 'src/core/interfaces';
import AppError from './app.error';

export default class ForbiddenEntryError extends AppError {
  statusCode: number;

  defaultErrorMessage: string = 'Forbidden Entry';

  constructor(message: string, errResponse?: IErrorResponse) {
    super(message, errResponse);
    this.statusCode = StatusCodes.FORBIDDEN;
    this.name = 'ForbiddenEntryError';
  }
}
