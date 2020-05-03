import { QueryInterface } from "sequelize";
import { uuids } from "./constants/uuids-constants";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          uuid: uuids.sebastian.user,
          email: "seblanco@fi.uba.ar",
          password: "SecurePassword1010",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
