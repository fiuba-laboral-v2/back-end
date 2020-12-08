import { ApplicantNotification, ApplicantNotificationMapper } from "$models/ApplicantNotification";
import { ApplicantNotificationNotFoundError } from "./Errors";
import { Transaction } from "sequelize";
import { ApplicantNotificationSequelizeModel } from "$models";

export const ApplicantNotificationRepository = {
  save: async (notification: ApplicantNotification, transaction?: Transaction) => {
    const sequelizeModel = ApplicantNotificationMapper.toPersistenceModel(notification);
    await sequelizeModel.save({ transaction });
    notification.setUuid(sequelizeModel.uuid);
    notification.setCreatedAt(sequelizeModel.createdAt);
  },
  findByUuid: async (uuid: string) => {
    const sequelizeModel = await ApplicantNotificationSequelizeModel.findByPk(uuid);
    if (!sequelizeModel) throw new ApplicantNotificationNotFoundError(uuid);

    return ApplicantNotificationMapper.toDomainModel(sequelizeModel);
  },
  findAll: () => ApplicantNotificationSequelizeModel.findAll(),
  truncate: () => ApplicantNotificationSequelizeModel.destroy({ truncate: true })
};
