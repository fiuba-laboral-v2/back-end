import { getOfferByUuid } from "./getOfferByUuid";
import { getOffers } from "./getOffers";

const offerQueries = {
  getOfferByUuid: getOfferByUuid,
  getOffers: getOffers
};

export { offerQueries };
