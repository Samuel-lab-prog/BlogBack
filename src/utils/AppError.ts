import { t } from 'elysia';
export type errorsType = {
  statusCode: number;
  errorMessages: string[];
};

export const errorSchema = t.Object({
  errorMessages: t.Array(t.String()),
  statusCode: t.Number(),
});

export class AppError extends Error {
  public statusCode: number;
  public errorMessages: string[];
  public originalError?: Error;

  constructor({ statusCode = 500, errorMessages = ['Application Error'], originalError }: errorsType & { originalError?: Error }) {
    super(errorMessages.join(', '));
    this.statusCode = statusCode;
    this.errorMessages = errorMessages;
    this.originalError = originalError;
  }
}
