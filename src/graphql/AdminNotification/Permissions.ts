import { isAdmin } from "$graphql/Rules";

export const adminNotificationPermissions = {
  Query: {
    getAdminNotifications: isAdmin,
    hasUnreadAdminNotifications: isAdmin
  }
};
