import { IRole } from "./Roles";

export class CurrentUser {
  public uuid: string;
  public email: string;
  public roles: IRole[];

  constructor(uuid: string, email: string, roles: IRole[]) {
    this.uuid = uuid;
    this.email = email;
    this.roles = roles;
  }
}
