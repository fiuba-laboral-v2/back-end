import { QueryInterface, INTEGER, TEXT, BOOLEAN } from "sequelize";

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
        type: TEXT
      },
      emailSignature: {
        allowNull: false,
        type: TEXT
      },
      automaticJobApplicationApproval: {
        allowNull: false,
        type: BOOLEAN
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
