import { QueryInterface, INTEGER } from "sequelize";

const TABLE_NAME = "SecretarySettings";

const OFFER_DURATION_IN_DAYS_DEFAULT_VALUE = 15;

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
        defaultValue: OFFER_DURATION_IN_DAYS_DEFAULT_VALUE,
        type: INTEGER
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
