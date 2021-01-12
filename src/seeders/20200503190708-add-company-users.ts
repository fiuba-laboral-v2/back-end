import { QueryInterface } from "sequelize";
import { claudio, marcos } from "./constants/companyUsers";
import { Environment } from "../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("CompanyUsers", [claudio.companyUser, marcos.companyUser]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("CompanyUsers", {});
  }
};
