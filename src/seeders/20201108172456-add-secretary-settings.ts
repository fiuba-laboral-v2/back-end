import { Secretary } from "../models/Admin/Interface";
import { QueryInterface } from "sequelize";

const createRecord = (secretary: Secretary, offerDurationInDays: number) => ({
  secretary,
  offerDurationInDays
});

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("SecretarySettings", [
      createRecord(Secretary.graduados, 15),
      createRecord(Secretary.extension, 15)
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("SecretarySettings", {});
  }
};
