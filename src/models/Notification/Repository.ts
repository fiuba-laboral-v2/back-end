import { Notification } from "$models";

export const NotificationRepository = {
  save: (notification: Notification) => notification.save(),
  findAll: () => Notification.findAll(),
  truncate: () => Notification.destroy({ truncate: true })
};
