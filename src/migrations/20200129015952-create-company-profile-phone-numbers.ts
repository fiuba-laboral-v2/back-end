import { DATE, INTEGER, QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("CompanyProfilePhoneNumbers", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: INTEGER
            },

            phoneNumber: {
                type: INTEGER
            },

            companyProfileId: {
                type: INTEGER
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
        return queryInterface.dropTable("CompanyProfilePhoneNumbers");
    }
};
