import { IOffer } from "../../../../src/models/Offer";

const saveOfferWithOnlyObligatoryData = (attributes: IOffer) => (
  {
    title: attributes.title,
    description: attributes.description,
    hoursPerDay: attributes.hoursPerDay,
    minimumSalary: attributes.minimumSalary,
    maximumSalary: attributes.maximumSalary
  }
);

export { saveOfferWithOnlyObligatoryData };
