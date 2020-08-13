export class MissingApprovedSubjectCountError extends Error {
  public static buildMessage() {
    return `approvedSubjectCount is mandatory if isGraduate is false`;
  }

  constructor() {
    super(MissingApprovedSubjectCountError.buildMessage());
  }
}
