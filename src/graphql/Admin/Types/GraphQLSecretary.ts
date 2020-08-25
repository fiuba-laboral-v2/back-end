import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { Secretary } from "$models/Admin";

export const GraphQLSecretary = GraphQLEnumType({
  name: "Secretary",
  possibleValues: Object.keys(Secretary)
});
