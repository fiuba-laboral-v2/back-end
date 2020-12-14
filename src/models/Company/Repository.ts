import { Database } from "$config";
import { ICompany, IUpdateCompany } from "./index";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { CompanyPhoneNumberRepository } from "$models/CompanyPhoneNumber";
import { CompanyNotFoundError, CompanyNotUpdatedError } from "./Errors";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CompanyApprovalEventRepository } from "./CompanyApprovalEvent";
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
  update: async ({ uuid, phoneNumbers, photos, ...companyAttributes }: IUpdateCompany) => {
    const [, [updatedCompany]] = await Company.update(companyAttributes, {
      where: { uuid },
      returning: true
    });
    if (!updatedCompany) throw new CompanyNotFoundError(uuid);

    return updatedCompany;
  },
  updateApprovalStatus: (adminUserUuid: string, companyUuid: string, status: ApprovalStatus) =>
    Database.transaction(async transaction => {
      const [numberOfUpdatedCompanies, [updatedCompany]] = await Company.update(
        { approvalStatus: status },
        { where: { uuid: companyUuid }, returning: true, transaction }
      );
      if (numberOfUpdatedCompanies !== 1) throw new CompanyNotUpdatedError(companyUuid);

      await CompanyApprovalEventRepository.save({
        adminUserUuid,
        company: updatedCompany,
        status: status,
        transaction
      });
      return updatedCompany;
    }),
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Company.findAll(options)
    }),
  truncate: () => Company.truncate({ cascade: true })
};
