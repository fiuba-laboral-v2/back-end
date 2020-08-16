import { QueryInterface } from "sequelize";
import { admin } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Admins", [admin.admin]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Admins", {});
  }
};
