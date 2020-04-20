import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn(
      "CompanyPhotos",
      "companyProfileId",
      "companyId"
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn(
      "CompanyPhotos",
      "companyId",
      "companyProfileId"
    );
  }
};
