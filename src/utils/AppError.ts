export type errorsType = {
  statusCode: number;
  messages?: string[];
};

export class AppError extends Error {
  public statusCode: number;
  public messages?: string[];

  constructor({ statusCode = 400, messages }: errorsType) {
    super(messages ? messages.join(", ") : "Application Error");
    this.statusCode = statusCode;
    this.messages = messages;
  }
}
