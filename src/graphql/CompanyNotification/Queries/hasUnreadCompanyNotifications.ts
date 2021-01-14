import { nonNull } from "$graphql/fieldTypes";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLHasUnreadCompanyNotifications } from "$graphql/CompanyNotification/Types/GraphQLHasUnreadCompanyNotifications";

export const hasUnreadCompanyNotifications = {
  type: nonNull(GraphQLHasUnreadCompanyNotifications),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => ({
    hasUnreadNotifications: await CompanyNotificationRepository.hasUnreadNotifications({
      companyUuid: currentUser.getCompanyRole().companyUuid
    })
  })
};
