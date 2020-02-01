import { DATE, INTEGER, STRING, QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("CompanyProfilePhotos", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: INTEGER
            },

            photo: {
                type: STRING
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
        return queryInterface.dropTable("CompanyProfilePhotos");
    }
};
