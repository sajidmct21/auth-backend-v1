export class ApiError extends Error {
  constructor(statusCode, message = "Some thing went wrong", data = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.name = this.name;
  }
}
