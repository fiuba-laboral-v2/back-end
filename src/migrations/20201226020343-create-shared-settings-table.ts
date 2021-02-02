import { QueryInterface, TEXT, UUID } from "sequelize";

const TABLE_NAME = "SharedSettings";

export = {
  up: (queryInterface: QueryInterface) =>
    queryInterface.createTable(TABLE_NAME, {
      uuid: {
        allowNull: false,
        primaryKey: true,
        type: UUID
      },
      companySignUpAcceptanceCriteria: {
        allowNull: false,
        type: TEXT
      },
      companyEditableAcceptanceCriteria: {
        allowNull: false,
        type: TEXT
      },
      editOfferAcceptanceCriteria: {
        allowNull: false,
        type: TEXT
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
