import { Transaction } from "sequelize";
import { CompanyUser } from "$models";

export const CompanyUserRepository = {
  save: (companyUser: CompanyUser, transaction?: Transaction) => companyUser.save({ transaction }),
  findByCompanyUuid: (companyUuid: string) => CompanyUser.findAll({ where: { companyUuid } }),
  findByUserUuidIfExists: (userUuid: string) => CompanyUser.findOne({ where: { userUuid } })
};
