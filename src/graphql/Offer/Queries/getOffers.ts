import { OfferRepository } from "$models/Offer";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";

const getOffers = {
  type: GraphQLPaginatedResults(GraphQLOffer),
  args: {
    updatedBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: string }) =>
    OfferRepository.findAll({ updatedBeforeThan })
};

export { getOffers };
