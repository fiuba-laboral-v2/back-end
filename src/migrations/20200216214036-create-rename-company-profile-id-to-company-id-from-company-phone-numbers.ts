import { QueryInterface } from "sequelize";

export = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.renameColumn(
          "CompanyPhoneNumbers",
          "companyProfileId",
          "companyId"
        );
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.renameColumn(
          "CompanyPhoneNumbers",
          "companyId",
          "companyProfileId"
        );
    }
};
