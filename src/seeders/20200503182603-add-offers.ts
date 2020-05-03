import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids-constants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Offers",
      [
        {
          uuid: "b2ab4f75-cea2-4026-b623-830f41d1803c",
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
