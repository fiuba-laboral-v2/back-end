import { ApplicantRole, IRole } from "./Roles";
import { CurrentUserHasNoApplicantRoleError } from "./Errors";
import { UserPermissions } from "$models/Permissions";

export class CurrentUser {
  public uuid: string;
  public email: string;
  public roles: IRole[];

  constructor(uuid: string, email: string, roles: IRole[]) {
    this.uuid = uuid;
    this.email = email;
    this.roles = roles;
  }

  public getApplicant() {
    const applicantRole = this.roles.find(role => role instanceof ApplicantRole);
    if (!applicantRole) throw new CurrentUserHasNoApplicantRoleError();

    return applicantRole;
  }

  public getPermissions() {
    return new UserPermissions(this);
  }
}
