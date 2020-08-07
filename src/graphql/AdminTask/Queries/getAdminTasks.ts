import { Boolean, List, nonNull } from "$graphql/fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "$models/AdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLAdminTask } from "../Types/GraphQLAdminTask";
import { GraphQLObjectType } from "graphql";

export const getAdminTasks = {
  type: new GraphQLObjectType({
    name: "PaginatedAdminTasks",
    fields: () => ({
      shouldFetchMore: {
        type: nonNull(Boolean)
      },
      tasks: {
        type: nonNull(List(nonNull(GraphQLAdminTask)))
      }
    })
  }),
  args: {
    adminTaskTypes: {
      type: nonNull(List(GraphQLAdminTaskType))
    },
    statuses: {
      type: nonNull(List(GraphQLApprovalStatus))
    },
    updatedBeforeThan: {
      type: GraphQLDateTime
    }
  },
  resolve: (_: undefined, filter: IAdminTasksFilter) =>
    AdminTaskRepository.find(filter)
};
