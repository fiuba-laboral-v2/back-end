import { IPermissions } from "$models/Permissions";

export interface IRole {
  getPermissions: () => IPermissions;
}
