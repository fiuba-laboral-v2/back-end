import { Transaction } from "sequelize";
import { CompanyUser } from "$models";
import { PaginationQuery } from "$models/PaginationQuery";
import { IFindLatest } from "./Interfaces";
import { CompanyUserNotFoundError } from "./Errors";

export const CompanyUserRepository = {
  save: (companyUser: CompanyUser, transaction?: Transaction) => companyUser.save({ transaction }),
  findByCompanyUuid: (companyUuid: string) => CompanyUser.findAll({ where: { companyUuid } }),
  findByUserUuidIfExists: (userUuid: string) => CompanyUser.findOne({ where: { userUuid } }),
  findByUserUuid: async (userUuid: string) => {
    const companyUser = await CompanyUserRepository.findByUserUuidIfExists(userUuid);
    if (!companyUser) throw new CompanyUserNotFoundError();

    return companyUser;
  },
  findLatestByCompany: ({ updatedBeforeThan, companyUuid }: IFindLatest) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      where: { companyUuid },
      query: options => CompanyUser.findAll(options),
      uuidKey: "uuid",
      order: [
        ["updatedAt", "DESC"],
        ["userUuid", "DESC"]
      ]
    }),
  truncate: () => CompanyUser.destroy({ truncate: true })
};
