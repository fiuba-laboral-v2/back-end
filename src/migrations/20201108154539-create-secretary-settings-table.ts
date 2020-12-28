import { QueryInterface, INTEGER, STRING } from "sequelize";

const TABLE_NAME = "SecretarySettings";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      secretary: {
        allowNull: false,
        primaryKey: true,
        type: "secretary"
      },
      offerDurationInDays: {
        allowNull: false,
        type: INTEGER
      },
      email: {
        allowNull: false,
        type: STRING
      },
      emailSignature: {
        allowNull: false,
        type: STRING
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
