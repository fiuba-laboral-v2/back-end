import { QueryInterface } from "sequelize";
import { devartis } from "./constants/companies";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Companies",
        [
          devartis.company
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "CompanyPhotos",
        [
          ...devartis.photos
        ],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "CompanyPhoneNumbers",
        [
          ...devartis.phoneNumbers
        ],
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
  }
};
