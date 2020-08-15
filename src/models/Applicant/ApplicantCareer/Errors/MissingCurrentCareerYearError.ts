export class MissingCurrentCareerYearError extends Error {
  public static buildMessage() {
    return `currentCareerYear is mandatory if isGraduate is false`;
  }

  constructor() {
    super(MissingCurrentCareerYearError.buildMessage());
  }
}
