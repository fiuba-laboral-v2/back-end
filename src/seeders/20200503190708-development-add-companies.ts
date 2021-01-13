import { QueryInterface } from "sequelize";
import { devartis, mercadoLibre } from "./constants/companies";
import { Environment } from "../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Companies", [devartis.company, mercadoLibre.company], {
        transaction
      });
      await queryInterface.bulkInsert(
        "CompanyPhotos",
        [...devartis.photos, ...mercadoLibre.photos],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "CompanyPhoneNumbers",
        [...devartis.phoneNumbers, ...mercadoLibre.phoneNumbers],
        { transaction }
      );
    });
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("CompanyPhotos", {}, { transaction });
      await queryInterface.bulkDelete("CompanyPhoneNumbers", {}, { transaction });
      return queryInterface.bulkDelete("Companies", {}, { transaction });
    });
  }
};
