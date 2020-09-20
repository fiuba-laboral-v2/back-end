import { Offer } from "$models";
import { IPermission } from "../Interface";

export class AdminPermissions implements IPermission {
  public canSeeOffer(offer: Offer) {
    return Promise.resolve(true);
  }
}
