import { nonNull, Boolean } from "$graphql/fieldTypes";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import { IApolloServerContext } from "$graphql/Context";

export const hasUnreadApplicantNotifications = {
  type: nonNull(Boolean),
  resolve: (_: undefined, __: undefined, { currentUser }: IApolloServerContext) =>
    ApplicantNotificationRepository.hasUnreadNotifications({
      applicantUuid: currentUser.getApplicantRole().applicantUuid
    })
};
