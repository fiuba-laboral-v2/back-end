export class AuthenticationError extends Error {
  constructor() {
    super("You are not authenticated");
  }
}
