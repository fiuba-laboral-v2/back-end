import { QueryInterface } from "sequelize";
import { manuel, mariano } from "./constants/companyUsers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("CompanyUsers", [manuel.companyUser, mariano.companyUser]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("CompanyUsers", {});
  }
};
