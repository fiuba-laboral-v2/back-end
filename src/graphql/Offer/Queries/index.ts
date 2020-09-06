import { getOfferByUuid } from "./getOfferByUuid";
import { getOffers } from "./getOffers";
import { getMyOffers } from "./getMyOffers";
import { getApprovedOffers } from "./getApprovedOffers";

export const offerQueries = {
  getOfferByUuid,
  getOffers,
  getMyOffers,
  getApprovedOffers
};
