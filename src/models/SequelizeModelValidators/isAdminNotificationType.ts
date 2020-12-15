import { adminNotificationTypeEnumValues } from "$models/AdminNotification";

export const isAdminNotificationType = {
  validate: {
    isIn: {
      msg: `AdminNotificationType must be one of these values: ${adminNotificationTypeEnumValues}`,
      args: [adminNotificationTypeEnumValues]
    }
  }
};
