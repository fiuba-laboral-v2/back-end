import { QueryInterface } from "sequelize";
import { devartisOffers, javaSenior } from "./constants/offers";

const getSections = (offersData: any) =>
  [].concat.apply(
    [],
    offersData.map(o => o.offerSections)
  );

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkInsert(
        "Offers",
        [...devartisOffers.map(o => o.offer), javaSenior.offer],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "OffersSections",
        [...getSections(devartisOffers), ...javaSenior.offerSections],
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
