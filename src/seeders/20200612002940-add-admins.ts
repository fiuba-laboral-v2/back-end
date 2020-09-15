import { QueryInterface } from "sequelize";
import { extensionAdmin, graduadosAdmin } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Admins", [extensionAdmin.admin, graduadosAdmin.admin]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Admins", {});
  }
};
