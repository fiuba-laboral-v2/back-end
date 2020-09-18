import { ApplicantRole, CompanyRole, AdminRole, IRole } from "./Roles";
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
    return this.roles.find(role => role instanceof ApplicantRole);
  }

  public getCompany() {
    return this.roles.find(role => role instanceof CompanyRole);
  }

  public getAdmin() {
    return this.roles.find(role => role instanceof AdminRole);
  }

  public getPermissions() {
    return new UserPermissions(this);
  }
}
