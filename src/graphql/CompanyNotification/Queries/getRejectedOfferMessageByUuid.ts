import { nonNull, String, ID } from "$graphql/fieldTypes";
import { CompanyNotificationRepository } from "$models/CompanyNotification";

export const getRejectedOfferMessageByUuid = {
  type: nonNull(String),
  args: {
    offerUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { offerUuid }: IArguments) => {
    const notification = await CompanyNotificationRepository.findLastRejectedOfferNotification(
      offerUuid
    );
    return notification.moderatorMessage;
  }
};

interface IArguments {
  offerUuid: string;
}
