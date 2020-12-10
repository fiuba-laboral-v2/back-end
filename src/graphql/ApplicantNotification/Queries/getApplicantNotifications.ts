import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLApplicantNotification } from "../Types/GraphQLApplicantNotification";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";

export const getApplicantNotifications = {
  type: GraphQLPaginatedResults(GraphQLApplicantNotification),
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
    const notifications = await ApplicantNotificationRepository.findLatestByApplicant({
      updatedBeforeThan,
      applicantUuid: currentUser.getApplicantRole().applicantUuid
    });
    const notificationUuids = notifications.results.map(({ uuid }) => uuid!);
    await ApplicantNotificationRepository.markAsReadByUuids(notificationUuids);
    return notifications;
  }
};
