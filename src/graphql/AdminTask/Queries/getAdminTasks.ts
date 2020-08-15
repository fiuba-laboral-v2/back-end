import { List, nonNull } from "$graphql/fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "$models/AdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLDateTime } from "graphql-iso-date";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLAdminTask } from "$graphql/AdminTask/Types/GraphQLAdminTask";
import { IAdminUser } from "$graphql/Context";
import { AdminRepository } from "$models/Admin";

export const getAdminTasks = {
  type: GraphQLPaginatedResults(GraphQLAdminTask),
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
  resolve: async (
    _: undefined,
    filter: IAdminTasksFilter,
    { currentUser }: { currentUser: IAdminUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.admin.userUuid);
    return AdminTaskRepository.find({ ...filter, secretary: admin.secretary });
  }
};
