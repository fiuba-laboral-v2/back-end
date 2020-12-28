export class SharedSettingsNotFoundError extends Error {
  public static buildMessage() {
    return `SharedSettings not present. Please check if the table was populated using the seeders`;
  }

  constructor() {
    super(SharedSettingsNotFoundError.buildMessage());
  }
}
