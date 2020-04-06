import faker from "faker";

const OfferMocks = {
  completeData: (companyId?: number) => {
    const minimumSalary = faker.random.number();
    return (
      {
        companyId: companyId,
        title: faker.name.title(),
        description: faker.lorem.sentence(),
        hoursPerDay: faker.random.number(),
        minimumSalary: minimumSalary,
        maximumSalary: minimumSalary + 1000
      }
    );
  },
  offerWithoutProperty: (companyId: number, property: string) => {
    const data = OfferMocks.completeData(companyId);
    delete data[property];
    return data;
  }
};

export { OfferMocks };
