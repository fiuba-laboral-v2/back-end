export class NotificationHasNoTaskForeignKeyError extends Error {
  public static buildMessage() {
    return "The notification must have only one task foreign key";
  }

  constructor() {
    super(NotificationHasNoTaskForeignKeyError.buildMessage());
  }
}
