export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User with email: ${email} does not exist`);
  }
}
