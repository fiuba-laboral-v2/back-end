import { getOfferByUuid } from "./getOfferByUuid";
import { getOffers } from "./getOffers";
import { getMyOffers } from "./getMyOffers";
import { getApprovedOffers } from "./getApprovedOffers";
import { getOfferVisibleByCurrentApplicant } from "./getOfferVisibleByCurrentApplicant";

export const offerQueries = {
  getOfferByUuid,
  getOffers,
  getMyOffers,
  getApprovedOffers,
  getOfferVisibleByCurrentApplicant
};
