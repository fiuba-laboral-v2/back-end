import { Transaction } from "sequelize";
import { AdminNotificationNotFoundError } from "./Errors";
import { AdminNotificationMapper } from "./Mapper";
import { AdminNotification } from "./AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";

export const AdminNotificationRepository = {
  save: async (notification: AdminNotification, transaction?: Transaction) => {
    const sequelizeModel = AdminNotificationMapper.toPersistenceModel(notification);
    await sequelizeModel.save({ transaction });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
  },
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
