import { Transaction } from "sequelize";
import { Notification } from "$models";

export const NotificationRepository = {
  save: (notification: Notification, transaction?: Transaction) =>
    notification.save({ transaction }),
  findByUuid: (uuid: string) => Notification.findByPk(uuid),
  findAll: () => Notification.findAll(),
  truncate: () => Notification.destroy({ truncate: true })
};
