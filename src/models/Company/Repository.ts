import { Transaction } from "sequelize";
import { IFindLatest } from "./Interfaces";
import { CompanyNotFoundError } from "./Errors";
import { Company, UserSequelizeModel } from "$models";
import { PaginationQuery } from "$models/PaginationQuery";
import { CompanyWhereClauseBuilder } from "$models/QueryBuilder";

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
  findLatest: ({ updatedBeforeThan, companyName, businessSector }: IFindLatest = {}) => {
    const clause = CompanyWhereClauseBuilder.build({ companyName, businessSector });
    return PaginationQuery.findLatest({
      ...(clause && { where: clause.where }),
      updatedBeforeThan,
      query: options => Company.findAll(options)
    });
  },
  truncate: () => Company.truncate({ cascade: true })
};
