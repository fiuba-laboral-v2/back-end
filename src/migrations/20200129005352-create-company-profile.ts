import { DATE, INTEGER, QueryInterface, STRING } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("CompanyProfiles", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: INTEGER
            },
            cuit: {
                allowNull: false,
                type: STRING
            },
            companyName: {
                allowNull: false,
                type: STRING
            },

            slogan: {
                type: STRING
            },

            description: {
                type: STRING
            },

            logo: {
                type: STRING
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
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable("CompanyProfiles");
    }
};
