import { nonNull } from "$graphql/fieldTypes";
import { AdminNotificationRepository } from "$models/AdminNotification";
import { AdminRepository } from "$models/Admin";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLHasUnreadAdminNotifications } from "../Types/GraphQLHasUnreadAdminNotifications";

export const hasUnreadAdminNotifications = {
  type: nonNull(GraphQLHasUnreadAdminNotifications),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdminRole().adminUserUuid);
    return {
      hasUnreadNotifications: await AdminNotificationRepository.hasUnreadNotifications({
        secretary: admin.secretary
      })
    };
  }
};
