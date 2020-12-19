export class CompanyNotFoundError extends Error {
  public static buildMessage(uuid?: string) {
    if (!uuid) return "Company does not exist";

    return `Company with uuid: ${uuid} does not exist`;
  }

  constructor(uuid?: string) {
    super(CompanyNotFoundError.buildMessage(uuid));
  }
}
