import { AdminPermissions } from "$models/Permissions";

export class AdminRole {
  public adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public getPermissions() {
    return new AdminPermissions();
  }
}
