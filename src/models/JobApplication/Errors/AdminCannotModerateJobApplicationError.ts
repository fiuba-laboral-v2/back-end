import { Admin } from "$models";

export class AdminCannotModerateJobApplicationError extends Error {
  public static buildMessage({ secretary }: Admin) {
    return `admin from ${secretary} secretary cannot moderate jobApplication`;
  }

  constructor(admin: Admin) {
    super(AdminCannotModerateJobApplicationError.buildMessage(admin));
  }
}
