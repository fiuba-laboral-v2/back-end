import { Transaction } from "sequelize";
import { Company, CompanyPhoneNumber } from "$models";

export const CompanyPhoneNumberRepository = {
  create: (phoneNumber: string, company: Company) =>
    CompanyPhoneNumber.create({
      phoneNumber: phoneNumber,
      companyUuid: company.uuid,
    }),
  bulkCreate: (phoneNumbers: string[] = [], company: Company, transaction?: Transaction) => {
    return CompanyPhoneNumber.bulkCreate(
      phoneNumbers.map(phoneNumber => ({
        phoneNumber,
        companyUuid: company.uuid,
      })),
      {
        transaction,
        validate: true,
      }
    );
  },
  findAll: () => CompanyPhoneNumber.findAll(),
  truncate: async () => {
    return CompanyPhoneNumber.destroy({ truncate: true });
  },
};
