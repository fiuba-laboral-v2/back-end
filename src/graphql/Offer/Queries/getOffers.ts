import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { List } from "../../fieldTypes";

const getOffers = {
  type: List(GraphQLOffer),
  resolve: async () => OfferRepository.findAll()
};

export { getOffers };
