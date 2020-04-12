import faker from "faker";
import { Career, CareerRepository, ICareer } from "../../../src/models/Career";

const careerMocks = {
  careerData: () => ({
    code: (faker.random.number()).toString(),
    description: faker.name.title(),
    credits: faker.random.number()
  }),
  createCareers: async (size: number) => {
    const careers: Career[] = [];
    for (let i = 0; i < size ; i++) {
      careers.push(await CareerRepository.create(careerMocks.careerData()));
    }
    return careers;
  }
};

export { careerMocks };
