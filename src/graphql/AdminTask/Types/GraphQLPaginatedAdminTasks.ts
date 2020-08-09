import { GraphQLObjectType } from "graphql";
import { Boolean, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLAdminTask } from "$graphql/AdminTask/Types/GraphQLAdminTask";

export const GraphQLPaginatedAdminTask = new GraphQLObjectType({
  name: "PaginatedAdminTasks",
  fields: () => ({
    shouldFetchMore: {
      type: nonNull(Boolean)
    },
    tasks: {
      type: nonNull(List(nonNull(GraphQLAdminTask)))
    }
  })
});
