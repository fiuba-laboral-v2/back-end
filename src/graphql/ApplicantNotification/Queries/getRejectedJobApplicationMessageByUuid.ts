import { nonNull, String, ID } from "$graphql/fieldTypes";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";

export const getRejectedJobApplicationMessageByUuid = {
  type: nonNull(String),
  args: {
    jobApplicationUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { jobApplicationUuid }: IArguments) => {
    const notification = await ApplicantNotificationRepository.findLastRejectedJobApplicationByUuid(
      jobApplicationUuid
    );
    return notification.moderatorMessage;
  }
};

interface IArguments {
  jobApplicationUuid: string;
}
