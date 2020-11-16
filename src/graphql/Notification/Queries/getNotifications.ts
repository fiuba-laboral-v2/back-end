import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLNotification } from "../Types/GraphQLNotification";
import { NotificationRepository } from "$models/Notification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";

export const getNotifications = {
  type: GraphQLPaginatedResults(GraphQLNotification),
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
    const notifications = await NotificationRepository.findLatestByUser({
      updatedBeforeThan,
      receiverUuid: currentUser.uuid
    });
    const notificationUuids = notifications.results.map(({ uuid }) => uuid);
    await NotificationRepository.markAsReadByUuids(notificationUuids);
    return notifications;
  }
};
