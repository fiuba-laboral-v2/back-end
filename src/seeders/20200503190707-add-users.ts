import { QueryInterface } from "sequelize";
import { aldana, sebastian } from "./constants/applicants";
import { manuel, mariano } from "./constants/companyUsers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        sebastian.user,
        manuel.user,
        aldana.user,
        mariano.user
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
