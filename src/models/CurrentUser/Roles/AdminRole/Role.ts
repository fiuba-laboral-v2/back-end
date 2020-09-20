import { AdminPermissions } from "$models/Permissions";
import { IRole } from "../Interface";

export class AdminRole implements IRole {
  public adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public getPermissions() {
    return new AdminPermissions();
  }
}
