import { Secretary } from "../../models/Admin/Interface";
import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("SecretarySettings", [
      {
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "test@fi.uba.ar",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: true
      },
      {
        secretary: Secretary.extension,
        offerDurationInDays: 15,
        email: "extension@fi.uba.ar",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: false
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    queryInterface.bulkDelete("SecretarySettings", {});
  }
};
