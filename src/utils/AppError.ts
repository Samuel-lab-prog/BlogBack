export type errorsType = {
  statusCode: number;
  messages?: String[];
};

export class AppError extends Error {
  public statusCode: number;
  public messages?: String[];

  constructor({statusCode = 400, messages}: errorsType) {
    super(messages ? messages.join(", ") : "Application Error");
    this.statusCode = statusCode;
    this.messages = messages;
  }
}
