import { QueryInterface } from "sequelize";
import { careerCodes } from "./constants/careerCodes";
import { Environment } from "../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;

    return queryInterface.bulkInsert("Careers", [
      {
        code: careerCodes.IngenieriaCivil,
        description: "Ingeniería Civil",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaIndustrial,
        description: "Ingeniería Industrial",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaNavalYMecanica,
        description: "Ingeniería Naval y Mecánica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.Agrimensura,
        description: "Agrimensura",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaMecanica,
        description: "Ingeniería Mecánica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaElectricista,
        description: "Ingeniería Electricista",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaElectronica,
        description: "Ingeniería Electrónica",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaQuimica,
        description: "Ingeniería Química",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.LicenciaturaEnAnalisisDeSistemas,
        description: "Licenciatura en Análisis de Sistemas",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaInformatica,
        description: "Ingeniería Informática",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaAlimentos,
        description: "Ingeniería Alimentos",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaAgrimensura,
        description: "Ingeniería Agrimensura",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: careerCodes.IngenieriaEnPetroleo,
        description: "Ingeniería en Petróleo",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("Careers", {}, {});
  }
};
