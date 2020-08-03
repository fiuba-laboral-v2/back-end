import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { List } from "../../fieldTypes";
import { GraphQLDateTime } from "graphql-iso-date";

const getOffers = {
  type: List(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: string }) =>
    OfferRepository.findAll({ updatedBeforeThan })
};

export { getOffers };
