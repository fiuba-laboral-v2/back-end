import { Transaction } from "sequelize";
import { Notification } from "$models";

export const NotificationRepository = {
  save: (notification: Notification, transaction?: Transaction) =>
    notification.save({ transaction }),
  findAll: () => Notification.findAll(),
  truncate: () => Notification.destroy({ truncate: true })
};
