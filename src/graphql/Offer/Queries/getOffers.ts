import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { Boolean, List, nonNull } from "../../fieldTypes";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLObjectType } from "graphql";

const getOffers = {
  type: new GraphQLObjectType({
    name: "PaginatedOffers",
    fields: () => ({
      shouldFetchMore: {
        type: nonNull(Boolean)
      },
      offers: {
        type: List(GraphQLOffer)
      }
    })
  }),
  args: {
    updatedBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: string }) =>
    OfferRepository.findAll({ updatedBeforeThan })
};

export { getOffers };
