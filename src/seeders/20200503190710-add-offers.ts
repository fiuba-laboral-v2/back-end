import { QueryInterface } from "sequelize";
import { devartisOffers, mercadoLibreOffers } from "./constants/offers";

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
        [...devartisOffers.map(o => o.offer), ...mercadoLibreOffers.map(o => o.offer)],
        { transaction }
      );
      await queryInterface.bulkInsert(
        "OffersSections",
        [...getSections(devartisOffers), ...getSections(mercadoLibreOffers)],
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
