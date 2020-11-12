import { Database } from "$config/Database";
import { Transaction } from "sequelize";
import { Notification } from "$models";
import { IFindAll } from "./Interfaces";
import { NotificationsNotUpdatedError } from "./Errors";
import { PaginationQuery } from "$models/PaginationQuery";

export const NotificationRepository = {
  save: (notification: Notification, transaction?: Transaction) =>
    notification.save({ transaction }),
  findLatestByUser: ({ updatedBeforeThan, userUuid }: IFindAll) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { userUuid },
      timestampKey: "createdAt",
      query: options => Notification.findAll(options),
      order: [
        ["isNew", "DESC"],
        ["createdAt", "DESC"],
        ["uuid", "DESC"]
      ]
    }),
  markAsReadByUuids: async (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedNotificationCount] = await Notification.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedNotificationCount !== uuids.length) throw new NotificationsNotUpdatedError();
    }),
  findByUuids: (uuids: string[]) => Notification.findAll({ where: { uuid: uuids } }),
  findByUuid: (uuid: string) => Notification.findByPk(uuid),
  findAll: () => Notification.findAll(),
  truncate: () => Notification.destroy({ truncate: true })
};
