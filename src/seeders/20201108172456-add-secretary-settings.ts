import { Secretary } from "../models/Admin/Interface";
import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SecretarySettings", [
      {
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "seblanco@fi.uba.ar",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: true
      },
      {
        secretary: Secretary.extension,
        offerDurationInDays: 15,
        email: "fiubalaboralv2@gmail.com",
        emailSignature: "Bolsa de Trabajo FIUBA",
        automaticJobApplicationApproval: false
      }
    ]);
  },
  down: (queryInterface: QueryInterface) => queryInterface.bulkDelete("SecretarySettings", {})
};
