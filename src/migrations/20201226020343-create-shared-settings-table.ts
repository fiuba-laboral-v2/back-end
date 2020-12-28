import { QueryInterface, STRING, UUID } from "sequelize";

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
        type: STRING
      },
      companyEditableAcceptanceCriteria: {
        allowNull: false,
        type: STRING
      },
      editOfferAcceptanceCriteria: {
        allowNull: false,
        type: STRING
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
