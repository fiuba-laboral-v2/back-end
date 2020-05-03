import { QueryInterface } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    const devartisUuid = "7f03fcfa-93a9-476b-881a-b81a7ea9dbd3";
    await queryInterface.bulkInsert(
      "Offers",
      [
        {
          uuid: "b2ab4f75-cea2-4026-b623-830f41d1803c",
          companyUuid: devartisUuid,
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
