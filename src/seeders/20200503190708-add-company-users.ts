import { QueryInterface } from "sequelize";
import { claudio, marcos } from "./constants/companyUsers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("CompanyUsers", [claudio.companyUser, marcos.companyUser]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("CompanyUsers", {});
  }
};
