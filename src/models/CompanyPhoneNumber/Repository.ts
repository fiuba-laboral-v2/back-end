import { Transaction } from "sequelize";
import { CompanyPhoneNumber } from "./index";
import { Company } from "../Company";

export const CompanyPhoneNumberRepository = {
  create: (phoneNumber: string, company: Company) =>
    CompanyPhoneNumber.create({ phoneNumber: phoneNumber, companyUuid: company.uuid }),
  bulkCreate: (phoneNumbers: string[] = [], company: Company, transaction?: Transaction) => {
    return CompanyPhoneNumber.bulkCreate(
      phoneNumbers.map(phoneNumber => ({ phoneNumber, companyUuid: company.uuid })),
      {
        transaction,
        validate: true,
        returning: true
      }
    );
  },
  findAll: () => CompanyPhoneNumber.findAll(),
  truncate: async () => {
    return CompanyPhoneNumber.destroy({ truncate: true });
  }
};
