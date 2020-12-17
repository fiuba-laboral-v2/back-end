import { Database } from "$config";
import { ICompany } from "./index";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { CompanyPhoneNumberRepository } from "$models/CompanyPhoneNumber";
import { CompanyNotFoundError } from "./Errors";
import { UserRepository, User } from "$models/User";
import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { CompanyUserRepository } from "$models/CompanyUser";
import { Company, CompanyUser, UserSequelizeModel } from "$models";
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
      const { password, email, surname, name } = userAttributes;
      const credentials = new CompanyUserRawCredentials({ password });
      const user = new User({ name, surname, email, credentials });
      await UserRepository.save(user, transaction);
      const company = await Company.create(companyAttributes, { transaction });
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
  findByUserUuid: async (userUuid: string) => {
    const company = await Company.findOne({
      include: [{ model: UserSequelizeModel, where: { uuid: userUuid } }]
    });
    if (!company) throw new CompanyNotFoundError();

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
