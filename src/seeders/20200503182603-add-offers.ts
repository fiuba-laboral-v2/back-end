import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Offers",
      [
        {
          uuid: uuids.offers.java_semi_senior,
          companyUuid: uuids.companies.devartis,
          title: "Desarrollador Java semi senior",
          description: "Que sepa Java",
          hoursPerDay: 6,
          minimumSalary: 52500,
          maximumSalary: 70000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.bulkDelete("Offers", {}, { transaction });
    });
  }
};
