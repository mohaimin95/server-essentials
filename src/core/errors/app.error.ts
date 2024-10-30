import { IErrorResponse } from 'src/core/interfaces';
import { StatusCodes } from 'http-status-codes';

export default class AppError extends Error {
  statusCode: number;

  defaultErrorMessage: string = 'App error occurred';

  errResponse?: IErrorResponse;

  constructor(message: string, errResponse?: IErrorResponse) {
    super();
    this.message = message?.trim() || this.defaultErrorMessage;
    this.statusCode = StatusCodes.NOT_IMPLEMENTED;
    this.name = 'UnkownAppError';
    this.errResponse = errResponse;
  }
}
