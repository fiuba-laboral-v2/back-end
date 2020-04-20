import { TEXT, STRING, QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "CompanyProfilePhotos",
      "photo",
      {
        type: TEXT
      }
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn(
      "CompanyProfilePhotos",
      "photo",
      {
        type: STRING
      }
    );
  }
};
