import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";
import { UUID } from "../../models/UUID";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    const federicoUserUuid = UUID.generate();
    const aldanaUserUuid = UUID.generate();
    await queryInterface.bulkInsert("Users", [
      {
        uuid: federicoUserUuid,
        email: "empleos@fi.uba.ar",
        name: "Federico",
        surname: "Resnik",
        dni: "26473142",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: aldanaUserUuid,
        email: "arastrelli@fi.uba.ar",
        name: "Aldana",
        surname: "Rastrelli",
        dni: "38532562",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    return queryInterface.bulkInsert("Admins", [
      {
        userUuid: federicoUserUuid,
        secretary: "extension",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userUuid: aldanaUserUuid,
        secretary: "graduados",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    await queryInterface.bulkDelete("Admins", {});
    return queryInterface.bulkDelete("Users", {});
  }
};
