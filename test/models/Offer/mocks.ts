const OfferMocks = {
  completeData: (companyId?: number) => ({
    companyId: companyId,
    title: "Java developer ssr",
    description: "something",
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000
  }),
  offerWithoutProperty: (companyId: number, property: string) => {
    const data = OfferMocks.completeData(companyId);
    delete data[property];
    return data;
  }
};

export { OfferMocks };
