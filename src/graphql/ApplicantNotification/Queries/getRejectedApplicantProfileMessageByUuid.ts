import { nonNull, String, ID } from "$graphql/fieldTypes";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";

export const getRejectedApplicantProfileMessageByUuid = {
  type: nonNull(String),
  args: {
    notifiedApplicantUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { notifiedApplicantUuid }: IArguments) => {
    const notification = await ApplicantNotificationRepository.findLastRejectedProfileNotification(
      notifiedApplicantUuid
    );
    return notification.moderatorMessage;
  }
};

interface IArguments {
  notifiedApplicantUuid: string;
}
