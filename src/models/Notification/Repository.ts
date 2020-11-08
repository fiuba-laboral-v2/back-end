import { Transaction } from "sequelize";
import { Notification } from "$models";
import { IFindAll } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";
import { JobApplicationRepository } from "$models/JobApplication";
import { MissingNotificationTypeError } from "./Errors";

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
  getType: async (notification: Notification) => {
    if (notification.jobApplicationUuid) {
      return JobApplicationRepository.findByUuid(notification.jobApplicationUuid);
    }
    throw new MissingNotificationTypeError();
  },
  truncate: () => Notification.destroy({ truncate: true })
};
