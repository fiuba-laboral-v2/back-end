import { nonNull } from "$graphql/fieldTypes";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLHasUnreadApplicantNotifications } from "../Types/GraphQLHasUnreadApplicantNotifications";

export const hasUnreadApplicantNotifications = {
  type: nonNull(GraphQLHasUnreadApplicantNotifications),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => ({
    hasUnreadNotifications: await ApplicantNotificationRepository.hasUnreadNotifications({
      applicantUuid: currentUser.getApplicantRole().applicantUuid
    })
  })
};
