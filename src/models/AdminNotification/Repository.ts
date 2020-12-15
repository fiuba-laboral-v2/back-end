import { Transaction } from "sequelize";
import { PaginationQuery } from "$models/PaginationQuery";
import { AdminNotificationNotFoundError, AdminNotificationsNotUpdatedError } from "./Errors";
import { AdminNotificationMapper } from "./Mapper";
import { AdminNotification } from "./AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";
import { IFindLatestBySecretary } from "./Interfaces";
import { Database } from "$config";

export const AdminNotificationRepository = {
  save: async (notification: AdminNotification, transaction?: Transaction) => {
    const sequelizeModel = AdminNotificationMapper.toPersistenceModel(notification);
    await sequelizeModel.save({ transaction });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
  },
  findLatestBySecretary: ({ secretary, updatedBeforeThan }: IFindLatestBySecretary) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { secretary },
      timestampKey: "createdAt",
      query: async options => {
        const notifications = await AdminNotificationSequelizeModel.findAll(options);
        return notifications.map(AdminNotificationMapper.toDomainModel);
      },
      order: [
        ["isNew", "DESC"],
        ["createdAt", "DESC"],
        ["uuid", "DESC"]
      ]
    }),
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await AdminNotificationSequelizeModel.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedCount !== uuids.length) throw new AdminNotificationsNotUpdatedError();
    }),
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await AdminNotificationSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new AdminNotificationNotFoundError(uuid);

    return AdminNotificationMapper.toDomainModel(sequelizeModel);
  },
  findByUuids: async (uuids: string[]) => {
    const sequelizeModels = await AdminNotificationSequelizeModel.findAll({
      where: { uuid: uuids }
    });
    return sequelizeModels.map(AdminNotificationMapper.toDomainModel);
  },
  findAll: async () => {
    const notifications = await AdminNotificationSequelizeModel.findAll();
    return notifications.map(AdminNotificationMapper.toDomainModel);
  },
  truncate: () => AdminNotificationSequelizeModel.destroy({ truncate: true })
};
