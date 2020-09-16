import { Offer } from "$models";

export class AdminPermissions {
  public canSeeOffer(offer: Offer) {
    return true;
  }
}
