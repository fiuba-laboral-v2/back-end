import { QueryInterface } from "sequelize";
import { federico, aldana } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Admins", [federico.admin, aldana.admin]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Admins", {});
  }
};
