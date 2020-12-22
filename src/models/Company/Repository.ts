import { CompanyNotFoundError } from "./Errors";
import { Company, UserSequelizeModel } from "$models";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { PaginationQuery } from "../PaginationQuery";
import { Transaction } from "sequelize";

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
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Company.findAll(options)
    }),
  truncate: () => Company.truncate({ cascade: true })
};
