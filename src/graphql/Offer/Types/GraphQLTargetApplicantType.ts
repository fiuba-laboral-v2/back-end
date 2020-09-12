import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { targetApplicantTypeEnumValues } from "$models/Offer";

export const GraphQLTargetApplicantType = GraphQLEnumType({
  name: "ApplicantType",
  possibleValues: targetApplicantTypeEnumValues
});
