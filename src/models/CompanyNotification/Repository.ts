import { Database } from "$config/Database";
import { TCompanyNotification, CompanyNotificationMapper } from "$models/CompanyNotification";
import { CompanyNotification } from "$models";
import { CompanyNotificationNotFoundError, CompanyNotificationsNotUpdatedError } from "./Errors";
import { Transaction } from "sequelize";
import { IFindLatestByCompany } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";

export const CompanyNotificationRepository = {
  save: async (notification: TCompanyNotification, transaction?: Transaction) => {
    const companyNotification = CompanyNotificationMapper.toPersistenceModel(notification);
    await companyNotification.save({ transaction });
    notification.setUuid(companyNotification.uuid);
    notification.setCreatedAt(companyNotification.createdAt);
  },
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await CompanyNotification.update(
        { isNew: false },
        { where: { uuid: uuids }, returning: false, validate: false, transaction }
      );
      if (updatedCount !== uuids.length) throw new CompanyNotificationsNotUpdatedError();
    }),
  findLatestByCompany: ({ updatedBeforeThan, companyUuid }: IFindLatestByCompany) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { notifiedCompanyUuid: companyUuid },
      timestampKey: "createdAt",
      query: async options => {
        const companyNotifications = await CompanyNotification.findAll(options);
        return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
      },
      order: [
        ["isNew", "DESC"],
        ["createdAt", "DESC"],
        ["uuid", "DESC"]
      ]
    }),
  findByUuids: async (uuids: string[]) => {
    const companyNotifications = await CompanyNotification.findAll({ where: { uuid: uuids } });
    return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
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
