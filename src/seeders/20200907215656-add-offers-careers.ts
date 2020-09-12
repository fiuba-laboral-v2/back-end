import { QueryInterface } from "sequelize";
import { careerCodes } from "./constants/careerCodes";
import { uuids } from "./constants/uuids";

const createRecord = (careerCode: string, offerUuid: string) => ({
  careerCode: careerCode,
  offerUuid: offerUuid,
  createdAt: new Date(),
  updatedAt: new Date()
});

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("OffersCareers", [
      createRecord(careerCodes.IngenieriaCivil, uuids.offers.java_semi_senior),
      createRecord(careerCodes.IngenieriaAgrimensura, uuids.offers.java_semi_senior),
      createRecord(careerCodes.IngenieriaEnPetroleo, uuids.offers.java_semi_senior),
      createRecord(careerCodes.IngenieriaIndustrial, uuids.offers.java_senior),
      createRecord(careerCodes.IngenieriaElectronica, uuids.offers.java_senior),
      createRecord(careerCodes.IngenieriaQuimica, uuids.offers.java_senior),
      createRecord(careerCodes.IngenieriaNavalYMecanica, uuids.offers.java_junior),
      createRecord(careerCodes.LicenciaturaEnAnalisisDeSistemas, uuids.offers.java_junior),
      createRecord(careerCodes.Agrimensura, uuids.offers.ruby_senior),
      createRecord(careerCodes.IngenieriaMecanica, uuids.offers.ruby_junior),
      createRecord(careerCodes.IngenieriaInformatica, uuids.offers.ruby_junior),
      createRecord(careerCodes.IngenieriaAlimentos, uuids.offers.ruby_junior),
      createRecord(careerCodes.IngenieriaElectricista, uuids.offers.ruby_semi_senior)
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("OffersCareers", {});
  }
};
