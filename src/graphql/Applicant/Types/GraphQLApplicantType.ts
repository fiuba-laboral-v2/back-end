import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { targetApplicantTypeEnumValues } from "$models/Applicant";

export const GraphQLApplicantType = GraphQLEnumType({
  name: "ApplicantType",
  possibleValues: targetApplicantTypeEnumValues
});
