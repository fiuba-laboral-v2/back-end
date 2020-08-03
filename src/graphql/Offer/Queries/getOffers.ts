import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { List } from "../../fieldTypes";
import { GraphQLDateTime } from "graphql-iso-date";

const getOffers = {
  type: List(GraphQLOffer),
  args: {
    createdBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, { createdBeforeThan }: { createdBeforeThan?: string }) =>
    OfferRepository.findAll({ createdBeforeThan })
};

export { getOffers };
