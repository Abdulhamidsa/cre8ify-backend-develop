export class AppError extends Error {
  public status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public details?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
