import { QueryInterface } from "sequelize";
import { extensionAdmin } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Admins", [extensionAdmin.admin]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Admins", {});
  }
};
