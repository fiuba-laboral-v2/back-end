import { Transaction } from "sequelize";
import { IFindLatest } from "./Interfaces";
import { CompanyNotFoundError } from "./Errors";
import { Company, UserSequelizeModel } from "$models";
import { PaginationQuery } from "../PaginationQuery";

export const CompanyRepository = {
  save: (company: Company, transaction?: Transaction) => company.save({ transaction }),
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findByUserUuidIfExists: async (userUuid: string) =>
    Company.findOne({ include: [{ model: UserSequelizeModel, where: { uuid: userUuid } }] }),
  findAll: () => Company.findAll(),
  findLatest: ({ updatedBeforeThan }: IFindLatest = {}) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Company.findAll(options)
    }),
  truncate: () => Company.truncate({ cascade: true })
};
