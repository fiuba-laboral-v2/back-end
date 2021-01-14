import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLCompanyNotification } from "../Types/GraphQLCompanyNotification";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { IApolloServerContext } from "$graphql/Context";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLHasUnreadCompanyNotifications } from "../Types/GraphQLHasUnreadCompanyNotifications";

export const getCompanyNotifications = {
  type: GraphQLPaginatedResults(GraphQLCompanyNotification, {
    hasUnreadNotifications: {
      type: nonNull(GraphQLHasUnreadCompanyNotifications)
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
    const companyUuid = currentUser.getCompanyRole().companyUuid;
    const notifications = await CompanyNotificationRepository.findLatestByCompany({
      updatedBeforeThan,
      companyUuid
    });
    const notificationUuids = notifications.results.map(({ uuid }) => uuid!);
    await CompanyNotificationRepository.markAsReadByUuids(notificationUuids);
    return {
      ...notifications,
      hasUnreadNotifications: {
        hasUnreadNotifications: await CompanyNotificationRepository.hasUnreadNotifications({
          companyUuid
        })
      }
    };
  }
};
