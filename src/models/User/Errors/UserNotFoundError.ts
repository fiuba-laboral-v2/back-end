export class UserNotFoundError extends Error {
  public static buildMessage({ email, uuid }: IUserNotFoundError) {
    if (email) return `User with email: ${email} does not exist`;
    return `User with uuid: ${uuid} does not exist`;
  }

  constructor(fields: IUserNotFoundError) {
    super(UserNotFoundError.buildMessage(fields));
  }
}

interface IUserNotFoundError {
  uuid?: string;
  email?: string;
}
