import { Secretary } from "$src/models/Admin";

export class SecretarySettingsNotFoundError extends Error {
  public static buildMessage(secretary: Secretary) {
    return `The SecretarySettings for the secretary of ${secretary} don't exists. Please check if the table was populated using the seeders`;
  }

  constructor(secretary: Secretary) {
    super(SecretarySettingsNotFoundError.buildMessage(secretary));
  }
}
