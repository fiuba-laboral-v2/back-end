import { QueryInterface } from "sequelize";
import { dylan, manuel, sebastian } from "./constants/applicants";
import { claudio, marcos } from "./constants/companyUsers";
import { federico, aldana } from "./constants/admins";

export = {
  up: (queryInterface: QueryInterface) => {
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
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
