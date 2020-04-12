import faker from "faker";
import { range } from "lodash";
import { CareerRepository, Career } from "../../../src/models/Career";

const careerMocks = {
  careerData: () => ({
    code: (faker.random.number()).toString(),
    description: faker.name.title(),
    credits: faker.random.number()
  }),
  createCareers: async (size: number) => {
    return Promise.all(range(0, size).map(code => (
      CareerRepository.create({
        code: String(code),
        description: faker.name.title(),
        credits: faker.random.number()
      })
    )));
  }
};

export { careerMocks };
