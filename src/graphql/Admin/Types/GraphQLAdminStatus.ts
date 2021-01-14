import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { adminStatusEnumValues } from "$models/Admin";

export const GraphQLAdminStatus = GraphQLEnumType({
  name: "AdminStatus",
  possibleValues: adminStatusEnumValues
});
