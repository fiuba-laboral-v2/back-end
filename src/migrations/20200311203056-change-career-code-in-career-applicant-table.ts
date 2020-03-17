import { STRING, INTEGER, QueryInterface } from "sequelize";


export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn(
      "CareersApplicants",
      "careerCode"
    );

    return queryInterface.addColumn(
      "CareersApplicants",
      "careerCode",
      {
        allowNull: false,
        primaryKey: true,
        type: STRING,
        references: { model: "Careers", key: "code" }
      }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn(
      "CareersApplicants",
      "careerCode"
    );

    return queryInterface.addColumn(
      "CareersApplicants",
      "careerCode",
      {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: INTEGER,
        references: { model: "Careers", key: "code" }
      }
    );
  }
};
