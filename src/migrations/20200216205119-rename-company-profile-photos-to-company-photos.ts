import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "CompanyProfilePhotos",
      "CompanyPhotos"
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameTable(
      "CompanyPhotos",
      "CompanyProfilePhotos"
    );
  }
};
