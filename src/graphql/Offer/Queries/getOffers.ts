import { OfferRepository } from "$models/Offer";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLPaginatedOffers } from "$graphql/Offer/Types/GraphQLPaginatedOffers";

const getOffers = {
  type: GraphQLPaginatedOffers,
  args: {
    updatedBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: string }) =>
    OfferRepository.findAll({ updatedBeforeThan })
};

export { getOffers };
