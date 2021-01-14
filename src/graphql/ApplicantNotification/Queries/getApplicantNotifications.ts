import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLApplicantNotification } from "../Types/GraphQLApplicantNotification";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLHasUnreadApplicantNotifications } from "../Types/GraphQLHasUnreadApplicantNotifications";

export const getApplicantNotifications = {
  type: GraphQLPaginatedResults(GraphQLApplicantNotification, {
    hasUnreadNotifications: {
      type: nonNull(GraphQLHasUnreadApplicantNotifications)
    }
  }),
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
    const applicantUuid = currentUser.getApplicantRole().applicantUuid;
    const notifications = await ApplicantNotificationRepository.findLatestByApplicant({
      updatedBeforeThan,
      applicantUuid
    });
    const notificationUuids = notifications.results.map(({ uuid }) => uuid!);
    await ApplicantNotificationRepository.markAsReadByUuids(notificationUuids);
    return {
      ...notifications,
      hasUnreadNotifications: {
        hasUnreadNotifications: await ApplicantNotificationRepository.hasUnreadNotifications({
          applicantUuid
        })
      }
    };
  }
};
