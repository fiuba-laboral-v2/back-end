import { Transaction } from "sequelize";
import { Company, CompanyUser, User } from "$models";

export const CompanyUserRepository = {
  create: (company: Company, user: User, transaction?: Transaction) => {
    return CompanyUser.create({ companyUuid: company.uuid, userUuid: user.uuid }, { transaction });
  },
  findByCompanyUuid: (companyUuid: string) => CompanyUser.findAll({ where: { companyUuid } })
};
