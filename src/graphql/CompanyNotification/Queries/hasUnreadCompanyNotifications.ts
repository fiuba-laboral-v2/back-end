import { nonNull, Boolean } from "$graphql/fieldTypes";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { IApolloServerContext } from "$graphql/Context";

export const hasUnreadCompanyNotifications = {
  type: nonNull(Boolean),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) =>
    CompanyNotificationRepository.hasUnreadNotification({
      companyUuid: currentUser.getCompany().companyUuid
    })
};
