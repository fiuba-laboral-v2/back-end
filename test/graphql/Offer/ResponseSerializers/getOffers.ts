import { Offer } from "../../../../src/models/Offer";
import { GraphQLResponse } from "../../ResponseSerializers";

const getOffers = async (offers: Offer[]) => (
  Promise.all(offers.map(offer => GraphQLResponse.offer.getOfferByUuid(offer)))
);

export { getOffers };
