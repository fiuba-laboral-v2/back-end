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
    const notifications = await AdminNotificationRepository.findLatestBySecretary({
      updatedBeforeThan,
      secretary: admin.secretary
    });
    const notificationUuids = notifications.results.map(({ uuid }) => uuid!);
    await AdminNotificationRepository.markAsReadByUuids(notificationUuids);
    return notifications;
  }
};
