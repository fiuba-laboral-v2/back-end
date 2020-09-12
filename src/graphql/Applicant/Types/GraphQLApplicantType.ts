import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { targetApplicantTypeEnumValues } from "$models/Offer";

export const GraphQLApplicantType = GraphQLEnumType({
  name: "ApplicantType",
  possibleValues: targetApplicantTypeEnumValues
});
