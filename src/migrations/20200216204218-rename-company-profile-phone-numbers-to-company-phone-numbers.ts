import { QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.renameTable(
          "CompanyProfilePhoneNumbers",
          "CompanyPhoneNumbers"
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.renameTable(
          "CompanyPhoneNumbers",
          "CompanyProfilePhoneNumbers"
        );
    }
};
