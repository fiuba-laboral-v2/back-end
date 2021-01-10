import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { OfferStatus } from "$models/Offer";

export const GraphQLOfferStatus = GraphQLEnumType({
  name: "OfferStatus",
  possibleValues: Object.keys(OfferStatus)
});
