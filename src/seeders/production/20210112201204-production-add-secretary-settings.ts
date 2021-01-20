import { Secretary } from "$models/Admin/Interface";
import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

const TABLE_NAME = "SecretarySettings";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    return queryInterface.bulkInsert(TABLE_NAME, [
      {
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "graduados@fi.uba.ar",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: true
      },
      {
        secretary: Secretary.extension,
        offerDurationInDays: 15,
        email: "empleos@fi.uba.ar",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: false
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    queryInterface.bulkDelete(TABLE_NAME, {});
  }
};
