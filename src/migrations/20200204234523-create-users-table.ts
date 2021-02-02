import { DATE, TEXT, UUID, QueryInterface } from "sequelize";

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
          type: TEXT
        },
        dni: {
          allowNull: true,
          type: TEXT
        },
        password: {
          allowNull: true,
          type: TEXT
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
        name: "Users_email_unique",
        transaction
      });
      await queryInterface.addConstraint("Users", ["dni"], {
        type: "unique",
        name: "Users_dni_unique",
        transaction
      });
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Users");
  }
};
