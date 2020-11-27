import { nonNull, Int } from "$graphql/fieldTypes";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { IApolloServerContext } from "$graphql/Context";

export const getCompanyNotificationUnreadCount = {
  type: nonNull(Int),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const notifications = await CompanyNotificationRepository.findLatestByCompany({
      companyUuid: currentUser.getCompany().companyUuid
    });
    return notifications.results.filter(({ isNew }) => isNew).length;
  }
};
