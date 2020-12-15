import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLAdminNotification } from "../Types/GraphQLAdminNotification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";

import { AdminNotificationRepository } from "$models/AdminNotification";
import { AdminRepository } from "$models/Admin";

export const getAdminNotifications = {
  type: GraphQLPaginatedResults(GraphQLAdminNotification),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: async (
    _: undefined,
    { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput },
    { currentUser }: IApolloServerContext
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdminRole().adminUserUuid);
    return AdminNotificationRepository.findLatestBySecretary({
      updatedBeforeThan,
      secretary: admin.secretary
    });
  }
};
