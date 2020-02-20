import { TEXT, INTEGER, QueryInterface } from "sequelize";


export = {
    up: async (queryInterface: QueryInterface) => {
      await queryInterface.removeColumn(
        "CareersApplicants",
        "careerCode"
      );
      await queryInterface.removeColumn(
        "Careers",
        "code"
      );

      queryInterface.addColumn(
        "Careers",
        "code",
        {
          allowNull: false,
          primaryKey: true,
          unique: true,
          type: TEXT
        }
      );

      return queryInterface.addColumn(
        "CareersApplicants",
        "careerCode",
        {
          allowNull: false,
          primaryKey: true,
          unique: true,
          type: TEXT,
          references: { model: "Careers", key: "code" }
        }
      );
    },

    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeColumn(
        "CareersApplicants",
        "careerCode"
      );
      await queryInterface.removeColumn(
        "Careers",
        "code"
      );
      await queryInterface.addColumn(
        "Careers",
        "code",
        {
          allowNull: false,
          primaryKey: true,
          unique: true,
          type: INTEGER
        }
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
