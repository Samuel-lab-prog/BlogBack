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

  constructor({ statusCode = 500, errorMessages = ['Application Error'] }: errorsType) {
    super(errorMessages.join(', '));
    this.statusCode = statusCode;
    this.errorMessages = errorMessages;
  }
}
