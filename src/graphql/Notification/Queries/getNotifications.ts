import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLNotification } from "../Types/GraphQLNotification";
import { NotificationRepository } from "$models/Notification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";
import { Notification } from "$models";

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
      userUuid: currentUser.uuid
    });
    for (const notification of notifications.results) {
      const updatedNotification = new Notification(notification.toJSON());
      updatedNotification.isNew = false;
      updatedNotification.isNewRecord = false;
      await NotificationRepository.save(updatedNotification);
    }
    return notifications;
  }
};
