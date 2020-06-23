export class CompanyNotUpdatedError extends Error {
  public static buildMessage(uuid: string) {
    return `Company with uuid: ${uuid} could not be updated`;
  }

  constructor(uuid: string) {
    super(CompanyNotUpdatedError.buildMessage(uuid));
  }
}
