import { GraphQLObjectType } from "graphql";
import { Boolean, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";

export const GraphQLPaginatedOffers = new GraphQLObjectType({
  name: "PaginatedOffers",
  fields: () => ({
    shouldFetchMore: {
      type: nonNull(Boolean)
    },
    offers: {
      type: nonNull(List(nonNull(GraphQLOffer)))
    }
  })
});
