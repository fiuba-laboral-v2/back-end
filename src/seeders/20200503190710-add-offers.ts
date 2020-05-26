import { QueryInterface } from "sequelize";
import { javaSemiSenior } from "./constants/offers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Offers",
        [
          javaSemiSenior.offer
        ]
      );
      await queryInterface.bulkInsert(
        "OffersSections",
        [
          ...javaSemiSenior.offerSections
        ]
      );
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("Offers", {}, { transaction });
      await queryInterface.bulkDelete("OffersSections", {}, { transaction });
    });
  }
};
