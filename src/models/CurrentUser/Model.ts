import { IRole } from "./Roles";
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

  public getPermissions() {
    return new UserPermissions(this);
  }
}
