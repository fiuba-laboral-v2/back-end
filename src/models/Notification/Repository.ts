import { Transaction } from "sequelize";
import { Notification } from "$models";
import { IFindAll } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";

export const NotificationRepository = {
  save: (notification: Notification, transaction?: Transaction) =>
    notification.save({ transaction }),
  findAll: ({ updatedBeforeThan, userUuid }: IFindAll = {}) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: userUuid ? { userUuid } : undefined,
      timestampKey: "createdAt",
      query: options => Notification.findAll(options),
      order: [
        ["isNew", "DESC"],
        ["createdAt", "DESC"],
        ["uuid", "DESC"]
      ]
    }),
  truncate: () => Notification.destroy({ truncate: true })
};
