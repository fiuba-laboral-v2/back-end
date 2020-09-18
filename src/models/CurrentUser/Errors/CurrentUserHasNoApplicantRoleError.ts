export class CurrentUserHasNoApplicantRoleError extends Error {
  public static buildMessage() {
    return "The current user has no applicant role";
  }

  constructor() {
    super(CurrentUserHasNoApplicantRoleError.buildMessage());
  }
}
