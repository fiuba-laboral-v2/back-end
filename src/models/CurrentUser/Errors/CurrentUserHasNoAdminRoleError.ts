export class CurrentUserHasNoAdminRoleError extends Error {
  public static buildMessage() {
    return "The current user has no admin role";
  }

  constructor() {
    super(CurrentUserHasNoAdminRoleError.buildMessage());
  }
}
