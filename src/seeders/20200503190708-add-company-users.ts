import { QueryInterface } from "sequelize";
import { manuel } from "./constants/companyUsers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "CompanyUsers",
      [
        manuel.companyUser
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("CompanyUsers", {});
  }
};
