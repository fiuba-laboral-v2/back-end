import { QueryInterface } from "sequelize";
import { devartis, mercadoLibre } from "./constants/companies";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Companies", [devartis.company, mercadoLibre.company], {
        transaction,
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
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("CompanyPhotos", {}, { transaction });
      await queryInterface.bulkDelete("CompanyPhoneNumbers", {}, { transaction });
      return queryInterface.bulkDelete("Companies", {}, { transaction });
    });
  },
};
