export class ForbiddenApprovedSubjectCountError extends Error {
  public static buildMessage() {
    return "approvedSubjectCount should not be present if isGraduate is true";
  }

  constructor() {
    super(ForbiddenApprovedSubjectCountError.buildMessage());
  }
}
