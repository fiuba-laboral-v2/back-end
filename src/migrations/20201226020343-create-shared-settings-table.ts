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
        type: STRING(1500)
      },
      companyEditableAcceptanceCriteria: {
        allowNull: false,
        type: STRING(1500)
      },
      editOfferAcceptanceCriteria: {
        allowNull: false,
        type: STRING(1500)
      }
    }),
  down: (queryInterface: QueryInterface) => queryInterface.dropTable(TABLE_NAME)
};
