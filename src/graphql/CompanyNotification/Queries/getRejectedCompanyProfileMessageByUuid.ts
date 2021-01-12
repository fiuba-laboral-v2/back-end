import { nonNull, String, ID } from "$graphql/fieldTypes";
import { CompanyNotificationRepository } from "$models/CompanyNotification";

export const getRejectedCompanyProfileMessageByUuid = {
  type: nonNull(String),
  args: {
    notifiedCompanyUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { notifiedCompanyUuid }: IArguments) => {
    const notification = await CompanyNotificationRepository.findLastRejectedProfileNotification(
      notifiedCompanyUuid
    );
    return notification.moderatorMessage;
  }
};

interface IArguments {
  notifiedCompanyUuid: string;
}
