import { ApplicantRole, CompanyRole, AdminRole, IRole } from "./Roles";
import { UserPermissions } from "$models/Permissions";

export class CurrentUser {
  public uuid: string;
  public email: string;
  public roles: IRole[];

  constructor({ uuid, email, roles }: ICurrentUser) {
    this.uuid = uuid;
    this.email = email;
    this.roles = roles;
  }

  public getApplicantRole() {
    return this.roles.find(role => role instanceof ApplicantRole) as ApplicantRole;
  }

  public getCompanyRole() {
    return this.roles.find(role => role instanceof CompanyRole) as CompanyRole;
  }

  public getAdminRole() {
    return this.roles.find(role => role instanceof AdminRole) as AdminRole;
  }

  public getPermissions() {
    return new UserPermissions(this);
  }
}

interface ICurrentUser {
  uuid: string;
  email: string;
  roles: IRole[];
}
