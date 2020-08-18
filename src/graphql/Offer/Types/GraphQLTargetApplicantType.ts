import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { targetApplicantTypeEnumValues } from "$models/Offer";

export const GraphQLTargetApplicantType = GraphQLEnumType({
  name: "TargetApplicantType",
  possibleValues: targetApplicantTypeEnumValues
});
