export class UnauthorizedError extends Error {
  constructor() {
    super("You are not authorized for this operation");
  }
}
