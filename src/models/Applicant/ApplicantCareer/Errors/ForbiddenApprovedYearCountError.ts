export class ForbiddenApprovedYearCountError extends Error {
  public static buildMessage() {
    return "approvedYearCount should not be present if isGraduate is true";
  }

  constructor() {
    super(ForbiddenApprovedYearCountError.buildMessage());
  }
}
