import { Secretary } from "../models/Admin/Interface";
import { QueryInterface } from "sequelize";

const createRecord = (secretary: Secretary, offerDurationInDays: number, email: string) => ({
  secretary,
  offerDurationInDays,
  email
});

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SecretarySettings", [
      createRecord(Secretary.graduados, 15, "seblanco@fi.uba.ar"),
      createRecord(Secretary.extension, 15, "seblanco@fi.uba.ar")
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("SecretarySettings", {});
  }
};
