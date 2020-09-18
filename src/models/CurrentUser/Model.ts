import { ApplicantRole, CompanyRole, AdminRole, IRole } from "./Roles";
import {
  CurrentUserHasNoApplicantRoleError,
  CurrentUserHasNoAdminRoleError,
  CurrentUserHasNoCompanyRoleError
} from "./Errors";
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

  public getCompany() {
    const companyRole = this.roles.find(role => role instanceof CompanyRole);
    if (!companyRole) throw new CurrentUserHasNoCompanyRoleError();

    return companyRole;
  }

  public getAdmin() {
    const adminRole = this.roles.find(role => role instanceof AdminRole);
    if (!adminRole) throw new CurrentUserHasNoAdminRoleError();

    return adminRole;
  }

  public getPermissions() {
    return new UserPermissions(this);
  }
}
