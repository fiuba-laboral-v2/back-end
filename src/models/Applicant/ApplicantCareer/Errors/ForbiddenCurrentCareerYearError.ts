export class ForbiddenCurrentCareerYearError extends Error {
  public static buildMessage() {
    return "currentCareerYear should not be present if isGraduate is true";
  }

  constructor() {
    super(ForbiddenCurrentCareerYearError.buildMessage());
  }
}
