import { BOOLEAN, UUID, DATE, STRING, TEXT, QueryInterface } from "sequelize";

const TABLE_NAME = "Companies";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        TABLE_NAME,
        {
          uuid: {
            allowNull: false,
            primaryKey: true,
            type: UUID
          },
          cuit: {
            allowNull: false,
            type: STRING
          },
          companyName: {
            allowNull: false,
            type: STRING
          },
          businessName: {
            allowNull: false,
            type: STRING
          },
          businessSector: {
            allowNull: false,
            type: STRING
          },
          hasAnInternshipAgreement: {
            allowNull: false,
            type: BOOLEAN
          },
          slogan: {
            type: STRING
          },
          description: {
            type: TEXT
          },
          logo: {
            type: TEXT
          },
          website: {
            type: TEXT
          },
          email: {
            type: STRING
          },
          approvalStatus: {
            allowNull: false,
            type: "approval_status",
            defaultValue: "pending"
          },
          createdAt: {
            allowNull: false,
            type: DATE
          },
          updatedAt: {
            allowNull: false,
            type: DATE
          }
        },
        { transaction }
      );
      await queryInterface.addConstraint(TABLE_NAME, ["cuit"], {
        type: "unique",
        name: "Companies_cuit_unique",
        transaction
      });
      await queryInterface.addConstraint(TABLE_NAME, ["businessName"], {
        type: "unique",
        name: "Companies_businessName_unique",
        transaction
      });
      await queryInterface.addIndex(TABLE_NAME, ["approvalStatus", "updatedAt", "uuid"], {
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
