import { Transaction } from "sequelize";
import { User } from "../User";
import { Company } from "../Company";
import { CompanyUser } from "./Model";

export const CompanyUserRepository = {
  create: (company: Company, user: User, transaction?: Transaction) => {
    return CompanyUser.create(
      { companyUuid: company.uuid, userUuid: user.uuid },
      { transaction }
    );
  }
};
