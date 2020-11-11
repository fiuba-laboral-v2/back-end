import { Transaction } from "sequelize";
import { Notification } from "$models";
import { IFindAll } from "./Interfaces";
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
  findByUuids: (uuids: string[]) => Notification.findAll({ where: { uuid: uuids } }),
  findAll: () => Notification.findAll(),
  truncate: () => Notification.destroy({ truncate: true })
};
