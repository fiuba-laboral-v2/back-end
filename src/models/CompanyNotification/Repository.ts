import { Database } from "$config/Database";
import { TCompanyNotification, CompanyNotificationMapper } from "$models/CompanyNotification";
import { CompanyNotificationSequelizeModel } from "$models";
import { CompanyNotificationNotFoundError, CompanyNotificationsNotUpdatedError } from "./Errors";
import { Transaction } from "sequelize";
import { IFindLatestByCompany, IHasUnreadNotifications } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";

export const CompanyNotificationRepository = {
  save: async (notification: TCompanyNotification, transaction?: Transaction) => {
    const companyNotification = CompanyNotificationMapper.toPersistenceModel(notification);
    await companyNotification.save({ transaction });
    notification.setUuid(companyNotification.uuid);
    notification.setCreatedAt(companyNotification.createdAt);
  },
  hasUnreadNotifications: async ({ companyUuid }: IHasUnreadNotifications) => {
    const [{ exists }] = await Database.query<Array<{ exists: boolean }>>(
      `
      SELECT EXISTS (
        SELECT *
         FROM "CompanyNotifications"
         WHERE "CompanyNotifications"."notifiedCompanyUuid" = '${companyUuid}'
         AND "CompanyNotifications"."isNew" = true
       )
    `,
      { type: "SELECT" }
    );
    return exists;
  },
  markAsReadByUuids: (uuids: string[]) =>
    Database.transaction(async transaction => {
      const [updatedCount] = await CompanyNotificationSequelizeModel.update(
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
        const companyNotifications = await CompanyNotificationSequelizeModel.findAll(options);
        return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
      },
      order: [
        ["isNew", "DESC"],
        ["createdAt", "DESC"],
        ["uuid", "DESC"]
      ]
    }),
  findByUuids: async (uuids: string[]) => {
    const companyNotifications = await CompanyNotificationSequelizeModel.findAll({
      where: { uuid: uuids }
    });
    return companyNotifications.map(CompanyNotificationMapper.toDomainModel);
  },
  findByUuid: async (uuid: string) => {
    const companyNotification = await CompanyNotificationSequelizeModel.findByPk(uuid);
    if (!companyNotification) throw new CompanyNotificationNotFoundError(uuid);

    return CompanyNotificationMapper.toDomainModel(companyNotification);
  },
  findAll: async () => {
    const companyNotifications = await CompanyNotificationSequelizeModel.findAll();
    return companyNotifications.map(companyNotification =>
      CompanyNotificationMapper.toDomainModel(companyNotification)
    );
  },
  truncate: () => CompanyNotificationSequelizeModel.destroy({ truncate: true })
};
