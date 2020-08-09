import { List, nonNull } from "$graphql/fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "$models/AdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLPaginatedAdminTask } from "$graphql/AdminTask/Types/GraphQLPaginatedAdminTasks";

export const getAdminTasks = {
  type: GraphQLPaginatedAdminTask,
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
