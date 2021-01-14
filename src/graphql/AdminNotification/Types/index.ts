import { GraphQLAdminNotification } from "./GraphQLAdminNotification";
import { GraphQLUpdatedCompanyProfileAdminNotification } from "./GraphQLUpdatedCompanyProfileAdminNotification";
import { GraphQLHasUnreadAdminNotifications } from "./GraphQLHasUnreadAdminNotifications";

export const adminNotificationTypes = [
  GraphQLAdminNotification,
  GraphQLHasUnreadAdminNotifications,
  GraphQLUpdatedCompanyProfileAdminNotification
];
