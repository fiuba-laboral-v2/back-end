import { DATE, STRING, TEXT, UUID, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable("Users", {
        uuid: {
          allowNull: false,
          primaryKey: true,
          type: UUID
        },
        email: {
          allowNull: false,
          type: STRING
        },
        dni: {
          allowNull: true,
          type: STRING
        },
        password: {
          allowNull: true,
          type: STRING
        },
        name: {
          allowNull: false,
          type: TEXT
        },
        surname: {
          allowNull: false,
          type: TEXT
        },
        createdAt: {
          allowNull: false,
          type: DATE
        },
        updatedAt: {
          allowNull: false,
          type: DATE
        }
      });
      await queryInterface.addConstraint("Users", ["email"], {
        type: "unique",
        name: "Users_email_key",
        transaction
      });
      await queryInterface.addConstraint("Users", ["dni"], {
        type: "unique",
        name: "Users_dni_key",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Users");
  }
};
