import { List, nonNull } from "$graphql/fieldTypes";
import { AdminTaskRepository, IAdminTasksFilter } from "$models/AdminTask";
import { GraphQLAdminTaskType } from "../Types/GraphQLAdminTaskType";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLAdminTask } from "$graphql/AdminTask/Types/GraphQLAdminTask";
import { IAdminUser } from "$graphql/Context";
import { AdminRepository } from "$models/Admin";
import { GraphQLPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

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
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (
    _: undefined,
    filter: IAdminTasksFilter,
    { currentUser }: { currentUser: IAdminUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.admin.userUuid);
    const a = await AdminTaskRepository.find({ ...filter, secretary: admin.secretary });
    return a;
  }
};
