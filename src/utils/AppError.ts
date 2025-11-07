import { t } from 'elysia';

export type errorsType = {
  statusCode?: number;
  errorMessages?: string[];
  originalError?: Error;
};

export const errorSchema = t.Object({
  errorMessages: t.Array(t.String()),
  statusCode: t.Number(),
});

export class AppError extends Error {
  public statusCode: number;
  public errorMessages: string[];
  public originalError?: Error;

  constructor({
    statusCode = 500,
    errorMessages = ['Application Error'],
    originalError,
  }: errorsType = {}) {
    super(errorMessages.join(', '));
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorMessages = errorMessages;
    this.originalError = originalError;
    Error.captureStackTrace?.(this, AppError);
  }
}
