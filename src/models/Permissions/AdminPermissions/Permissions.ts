import { Offer } from "$models";
import { IPermission } from "../Interface";

export class AdminPermissions implements IPermission {
  public canSeeOffer(_: Offer) {
    return Promise.resolve(true);
  }
}
