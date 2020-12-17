export class CompanyNotFoundError extends Error {
  public static buildMessage(uuid?: string) {
    if (!uuid) return "Company does not exists";

    return `Company with uuid: ${uuid} does not exists`;
  }

  constructor(uuid?: string) {
    super(CompanyNotFoundError.buildMessage(uuid));
  }
}
