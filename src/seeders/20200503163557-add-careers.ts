import { QueryInterface } from "sequelize";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Careers",
      [
        {
          code: "1",
          description: "Ingeniería Civil",
          credits: 240,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "2",
          description: "Ingeniería Industrial",
          credits: 283,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "3",
          description: "Ingeniería Naval y Mecánica",
          credits: 264,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "4",
          description: "Agrimensura",
          credits: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "5",
          description: "Ingeniería Mecánica",
          credits: 260,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "6",
          description: "Ingeniería Electricista",
          credits: 280,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "7",
          description: "Ingeniería Electrónica",
          credits: 278,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "8",
          description: "Ingeniería Química",
          credits: 252,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "9",
          description: "Licenciatura en Análisis de Sistemas ",
          credits: 176,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "10",
          description: "Ingeniería Informática",
          credits: 248,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "11",
          description: "Ingeniería Alimentos",
          credits: 144,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "12",
          description: "Ingeniería Agrimensura",
          credits: 246,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: "13",
          description: "Ingeniería en Petróleo",
          credits: 246,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Careers", {}, {});
  }
};
