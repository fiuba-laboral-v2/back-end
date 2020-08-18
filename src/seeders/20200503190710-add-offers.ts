import { QueryInterface } from "sequelize";
import { javaSemiSenior } from "./constants/offers";
import { javaSenior } from "./constants/offers/javaSenior";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Offers", [javaSemiSenior.offer, javaSenior.offer], {
        transaction
      });
      await queryInterface.bulkInsert(
        "OffersSections",
        [...javaSemiSenior.offerSections, ...javaSenior.offerSections],
        { transaction }
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
