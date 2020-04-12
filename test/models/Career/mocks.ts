import faker from "faker";
import { CareerRepository } from "../../../src/models/Career";

const careerMocks = {
  careerData: () => ({
    code: (faker.random.number()).toString(),
    description: faker.name.title(),
    credits: faker.random.number()
  }),
  createTenCareers: async () => (
    Promise.all(
      [
        { code: "10", description: "Ingenieria Química", credits: 243 },
        { code: "11", description: "Ingenieria Electrónica", credits: 243 },
        { code: "12", description: "Ingenieria Informatica", credits: 243 },
        { code: "13", description: "Ingenieria Civil", credits: 243 },
        { code: "14", description: "Ingenieria Mecánica", credits: 243 },
        { code: "15", description: "Ingenieria Indistrial", credits: 243 },
        { code: "16", description: "Ingenieria en Alimentos", credits: 243 },
        { code: "17", description: "Ingenieria en Petróleo", credits: 243} ,
        { code: "18", description: "Ingenieria en Agrimensura", credits: 243 },
        { code: "19", description: "Ingenieria Naval", credits: 243 },
        { code: "20", description: "Lic. en Análisis de Sistemas", credits: 243 }
      ].map(career => CareerRepository.create(career))
    )
  )
};

export { careerMocks };
