import { QueryInterface } from "sequelize";
import { aldana, sebastian } from "./constants/applicants";
import { manuel, mariano } from "./constants/companyUsers";
import { extensionAdmin, graduadosAdmin } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Users", [
      graduadosAdmin.user,
      extensionAdmin.user,
      sebastian.user,
      manuel.user,
      aldana.user,
      mariano.user
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
