import { nonNull, Boolean } from "$graphql/fieldTypes";
import { AdminNotificationRepository } from "$models/AdminNotification";
import { AdminRepository } from "$models/Admin";
import { IApolloServerContext } from "$graphql/Context";

export const hasUnreadAdminNotifications = {
  type: nonNull(Boolean),
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdminRole().adminUserUuid);
    return AdminNotificationRepository.hasUnreadNotifications({ secretary: admin.secretary });
  }
};
