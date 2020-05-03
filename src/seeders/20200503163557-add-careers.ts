import { QueryInterface } from "sequelize";
import { careerCodes } from "./constants/careerCodes";

export = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "Careers",
      [
        {
          code: careerCodes.IngenieriaCivil,
          description: "Ingeniería Civil",
          credits: 240,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaIndustrial,
          description: "Ingeniería Industrial",
          credits: 283,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaNavalYMecanica,
          description: "Ingeniería Naval y Mecánica",
          credits: 264,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.Agrimensura,
          description: "Agrimensura",
          credits: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaMecanica,
          description: "Ingeniería Mecánica",
          credits: 260,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaElectricista,
          description: "Ingeniería Electricista",
          credits: 280,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaElectronica,
          description: "Ingeniería Electrónica",
          credits: 278,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaQuimica,
          description: "Ingeniería Química",
          credits: 252,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.LicenciaturaEnAnalisisDeSistemas,
          description: "Licenciatura en Análisis de Sistemas",
          credits: 176,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaInformatica,
          description: "Ingeniería Informática",
          credits: 248,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaAlimentos,
          description: "Ingeniería Alimentos",
          credits: 144,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaAgrimensura,
          description: "Ingeniería Agrimensura",
          credits: 246,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          code: careerCodes.IngenieriaEnPetroleo,
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
