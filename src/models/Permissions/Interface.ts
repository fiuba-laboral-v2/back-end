import { Offer } from "$models";

export interface IPermission {
  canSeeOffer: (offer: Offer) => Promise<boolean>;
}
