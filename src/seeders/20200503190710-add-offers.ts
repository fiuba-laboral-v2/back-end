import { QueryInterface } from "sequelize";
import { flatten } from "lodash";
import { offers } from "./constants/offers";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert("Offers", [...offers.map(offerData => offerData.offer)], {
        transaction
      });
      await queryInterface.bulkInsert(
        "OffersSections",
        [...flatten(offers.map(offerData => offerData.offerSections))],
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
