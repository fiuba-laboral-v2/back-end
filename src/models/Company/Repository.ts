import { Transaction } from "sequelize";
import { IFindLatest } from "./Interfaces";
import { CompanyNotFoundError } from "./Errors";
import { Company, UserSequelizeModel } from "$models";
import { PaginationQuery } from "$models/PaginationQuery";
import { CompanyWhereClauseBuilder } from "$models/QueryBuilder";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    const where = CompanyWhereClauseBuilder.build({ companyName, businessSector });
    return PaginationQuery.findLatest({
      ...(where && { where: where }),
      updatedBeforeThan,
      query: options => Company.findAll(options)
    });
  },
  countCompanies: () => Company.count({ where: { approvalStatus: ApprovalStatus.approved } }),
  truncate: () => Company.truncate({ cascade: true })
};
