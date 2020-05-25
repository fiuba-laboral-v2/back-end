import { QueryInterface } from "sequelize";
import { hashSync } from "bcrypt";
import { uuids } from "./constants/uuids";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          uuid: uuids.sebastian.user,
          email: "seblanco@fi.uba.ar",
          password: hashSync("SecurePassword1010", 10),
          name: "Sebastián",
          surname: "Blanco",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.manuel.user,
          email: "mllauro@devartis.com",
          password: hashSync("SecurePassword1010", 10),
          name: "Manuel",
          surname: "Llauró",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          uuid: uuids.aldana.user,
          email: "arastrelli@fi.uba.ar",
          password: "$2b$10$Mql5/mLtH.lJy0CxfjfozOuVWkztx4X3LAWh.WL5vXMv9pktoXDyW",
          name: "Aldana",
          surname: "Rastrelli",
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
