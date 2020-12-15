import { Database } from "$config";
import { ICompany } from "./index";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { CompanyPhoneNumberRepository } from "$models/CompanyPhoneNumber";
import { CompanyNotFoundError } from "./Errors";
import { UserRepository } from "$models/User";
import { CompanyUserRepository } from "$models/CompanyUser";
import { Company, CompanyUser } from "$models";
import { IPaginatedInput } from "$src/graphql/Pagination/Types/GraphQLPaginatedInput";
import { PaginationQuery } from "../PaginationQuery";
import { Transaction } from "sequelize";

export const CompanyRepository = {
  save: (company: Company, transaction?: Transaction) => company.save({ transaction }),
  create: ({
    phoneNumbers = [],
    photos = [],
    user: userAttributes,
    ...companyAttributes
  }: ICompany) =>
    Database.transaction(async transaction => {
      const user = await UserRepository.create(userAttributes, transaction);
      const company = await Company.create(companyAttributes, {
        transaction: transaction
      });
      const companyUser = new CompanyUser({ companyUuid: company.uuid, userUuid: user.uuid });
      await CompanyUserRepository.save(companyUser, transaction);
      await CompanyPhotoRepository.bulkCreate(photos, company, transaction);
      await CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company, transaction);
      return company;
    }),
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findAll: () => Company.findAll(),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Company.findAll(options)
    }),
  truncate: () => Company.truncate({ cascade: true })
};
