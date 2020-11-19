import { TCompanyNotification, CompanyNotificationMapper } from "$models/CompanyNotification";
import { CompanyNotification } from "$models";
import { CompanyNotificationNotFoundError } from "./Errors";
import { Transaction } from "sequelize";
import { IFindAll } from "./Interfaces";
import { PaginationQuery } from "$models/PaginationQuery";

export const CompanyNotificationRepository = {
  save: async (notification: TCompanyNotification, transaction?: Transaction) => {
    const companyNotification = CompanyNotificationMapper.toPersistenceModel(notification);
    await companyNotification.save({ transaction });
    notification.setUuid(companyNotification.uuid);
    notification.setCreatedAt(companyNotification.createdAt);
  },
  findLatestByCompany: ({ updatedBeforeThan, companyUuid }: IFindAll) =>
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
