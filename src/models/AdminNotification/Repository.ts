import { Transaction } from "sequelize";
import { PaginationQuery } from "$models/PaginationQuery";
import { AdminNotificationNotFoundError } from "./Errors";
import { AdminNotificationMapper } from "./Mapper";
import { AdminNotification } from "./AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";
import { IFindLatestBySecretary } from "./Interfaces";

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
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await AdminNotificationSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new AdminNotificationNotFoundError(uuid);

    return AdminNotificationMapper.toDomainModel(sequelizeModel);
  },
  findAll: async () => {
    const notifications = await AdminNotificationSequelizeModel.findAll();
    return notifications.map(AdminNotificationMapper.toDomainModel);
  },
  truncate: () => AdminNotificationSequelizeModel.destroy({ truncate: true })
};
