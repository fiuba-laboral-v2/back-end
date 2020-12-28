import { Secretary } from "../models/Admin/Interface";
import { QueryInterface } from "sequelize";

const createRecord = (
  secretary: Secretary,
  offerDurationInDays: number,
  email: string,
  emailSignature: string
) => ({
  secretary,
  offerDurationInDays,
  email,
  emailSignature
});

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SecretarySettings", [
      createRecord(Secretary.graduados, 15, "seblanco@fi.uba.ar", "Bolsa de Trabajo FIUBA"),
      createRecord(Secretary.extension, 15, "fiubalaboralv2@gmail.com", "Bolsa de Trabajo FIUBA")
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("SecretarySettings", {});
  }
};
