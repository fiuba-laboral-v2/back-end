import faker from "faker";

const careerMocks = {
  careerData: () => ({
    code: (faker.random.number()).toString(),
    description: faker.name.title(),
    credits: faker.random.number()
  })
};

export { careerMocks };
