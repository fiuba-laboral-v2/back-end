import { QueryInterface } from "sequelize";
import { dylan, manuel, sebastian } from "../constants/applicants";
import { claudio, marcos } from "../constants/companyUsers";
import { federico, aldana } from "../constants/admins";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("Users", [
      dylan.user,
      manuel.user,
      sebastian.user,
      claudio.user,
      marcos.user,
      federico.user,
      aldana.user
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("Users", {});
  }
};
