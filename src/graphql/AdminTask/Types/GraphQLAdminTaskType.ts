import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { AdminTaskType } from "$models/AdminTask";

export const GraphQLAdminTaskType = GraphQLEnumType({
  name: "AdminTaskType",
  values: Object.keys(AdminTaskType)
});
