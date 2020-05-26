import { Company, ICompany, ICompanyEditable } from "./index";
import { CompanyPhotoRepository } from "../CompanyPhoto";
import { CompanyPhoneNumberRepository } from "../CompanyPhoneNumber";
import { CompanyNotFoundError } from "./Errors/CompanyNotFoundError";
import Database from "../../config/Database";
import { UserRepository } from "../User";
import { CompanyUserRepository } from "../CompanyUser/Repository";

export const CompanyRepository = {
  create: async (
    {
      phoneNumbers= [],
      photos= [],
      user: userAttributes,
      ...companyAttributes
    }: ICompany
  ) => {
    const transaction = await Database.transaction();
    try {
      const user = await UserRepository.create(userAttributes, transaction);
      const company = await Company.create(companyAttributes, { transaction: transaction });
      await CompanyUserRepository.create(company, user, transaction);
      await CompanyPhotoRepository.bulkCreate(photos, company, transaction);
      await CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company, transaction);
      await transaction.commit();
      return company;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  update: async (
    {
      uuid,
      phoneNumbers,
      photos,
      ...companyAttributes
    }: ICompanyEditable
  ) => {
    const company = await CompanyRepository.findByUuid(uuid);
    const transaction = await Database.transaction();
    try {
      await company.set(companyAttributes);
      await CompanyPhotoRepository.update(photos, company, transaction);
      await CompanyPhoneNumberRepository.update(phoneNumbers, company, transaction);
      await company.save({ transaction });
      await transaction.commit();
      return company;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  findByUuid: async (uuid: string) => {
    const company = await Company.findByPk(uuid);
    if (!company) throw new CompanyNotFoundError(uuid);

    return company;
  },
  findAll: async () => {
    return Company.findAll();
  },
  truncate: () => Company.truncate({ cascade: true })
};
