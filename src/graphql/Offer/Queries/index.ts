import { getOfferByUuid } from "./getOfferByUuid";
import { getOffers } from "./getOffers";
import { getMyOffers } from "./getMyOffers";
import { getApprovedOffers } from "./getApprovedOffers";
import { getApplicantOfferByUuid } from "./getApplicantOfferByUuid";

export const offerQueries = {
  getOfferByUuid,
  getOffers,
  getMyOffers,
  getApprovedOffers,
  getApplicantOfferByUuid
};
