import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

const TABLE_NAME = "Careers";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;

    return queryInterface.bulkInsert(TABLE_NAME, [
      {
        code: "1",
        description: "Ingeniería Civil",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "2",
        description: "Ingeniería Industrial",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "3",
        description: "Ingeniería Naval y Mecánica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "4",
        description: "Agrimensura",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "5",
        description: "Ingeniería Mecánica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "6",
        description: "Ingeniería Electricista",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "7",
        description: "Ingeniería Electrónica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "8",
        description: "Ingeniería Química",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "9",
        description: "Licenciatura en Análisis de Sistemas",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "10",
        description: "Ingeniería Informática",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "11",
        description: "Ingeniería Alimentos",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "12",
        description: "Ingeniería Agrimensura",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "13",
        description: "Ingeniería en Petróleo",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    return queryInterface.bulkDelete(TABLE_NAME, {}, {});
  }
};
