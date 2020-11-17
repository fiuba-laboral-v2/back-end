import { TCompanyNotification, CompanyNotificationMapper } from "$models/CompanyNotification";
import { CompanyNotification } from "$models";
import { CompanyNotificationNotFoundError } from "./Errors";
import { Transaction } from "sequelize";

export const CompanyNotificationRepository = {
  save: async (notification: TCompanyNotification, transaction?: Transaction) => {
    const companyNotification = CompanyNotificationMapper.toPersistenceModel(notification);
    await companyNotification.save({ transaction });
    notification.uuid = companyNotification.uuid;
    notification.createdAt = companyNotification.createdAt;
  },
  findByUuid: async (uuid: string) => {
    const companyNotification = await CompanyNotification.findByPk(uuid);
    if (!companyNotification) throw new CompanyNotificationNotFoundError(uuid);

    return CompanyNotificationMapper.toDomainModel(companyNotification);
  },
  findAll: async () => {
    const companyNotifications = await CompanyNotification.findAll();
    return companyNotifications.map(companyNotification =>
      CompanyNotificationMapper.toDomainModel(companyNotification)
    );
  },
  truncate: () => CompanyNotification.destroy({ truncate: true })
};
