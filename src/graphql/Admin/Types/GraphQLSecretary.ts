import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { SecretaryEnumValues } from "$models/Admin";

export const GraphQLSecretary = GraphQLEnumType({
  name: "Secretary",
  possibleValues: SecretaryEnumValues
});
