export class MissingApprovedYearCountError extends Error {
  public static buildMessage() {
    return `approvedYearCount is mandatory if isGraduate is false`;
  }

  constructor() {
    super(MissingApprovedYearCountError.buildMessage());
  }
}
