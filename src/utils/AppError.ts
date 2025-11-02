import { type errorsType } from './types.ts';
export class AppError extends Error {
  public statusCode: number;
  public errorMessages?: string[];

  constructor({ statusCode = 400, errorMessages }: errorsType) {
    super(errorMessages ? errorMessages.join(', ') : 'Application Error');
    this.statusCode = statusCode;
    this.errorMessages = errorMessages;
  }
}
