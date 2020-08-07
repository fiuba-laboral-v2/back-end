import { Boolean, List, nonNull } from "$graphql/fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "$models/AdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLObjectType } from "graphql";
import { GraphQLAdminTask } from "../Types/GraphQLAdminTask";

export const getAdminTasks = {
  type: nonNull(List(GraphQLAdminTask)),
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
