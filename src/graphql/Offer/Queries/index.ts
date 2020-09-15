import { getOfferByUuid } from "./getOfferByUuid";
import { getOffers } from "./getOffers";
import { getMyOffers } from "./getMyOffers";
import { getApprovedOffers } from "./getApprovedOffers";
import { getOfferForApplicant } from "./getOfferForApplicant";

export const offerQueries = {
  getOfferByUuid,
  getOffers,
  getMyOffers,
  getApprovedOffers,
  getOfferForApplicant
};
