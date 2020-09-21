import { Offer } from "$models";
import { IPermission } from "../Interface";

export class AdminPermissions implements IPermission {
  public readonly adminUserUuid: string;

  constructor(adminUserUuid: string) {
    this.adminUserUuid = adminUserUuid;
  }

  public canSeeOffer(_: Offer) {
    return Promise.resolve(true);
  }
}
