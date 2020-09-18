export class CurrentUserHasNoCompanyRoleError extends Error {
  public static buildMessage() {
    return "The current user has no company role";
  }

  constructor() {
    super(CurrentUserHasNoCompanyRoleError.buildMessage());
  }
}
