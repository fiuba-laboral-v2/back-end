import { IPermission } from "$models/Permissions";

export interface IRole {
  getPermissions: () => IPermission;
}
