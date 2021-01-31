import { ApplicantRole, CompanyRole, AdminRole, IRole } from "./Roles";
import { UserPermissions } from "$models/Permissions";

export class CurrentUser {
  public uuid: string;
  public roles: IRole[];

  constructor({ uuid, roles }: ICurrentUser) {
    this.uuid = uuid;
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
  roles: IRole[];
}
