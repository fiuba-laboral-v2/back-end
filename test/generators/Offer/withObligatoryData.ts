import { IOffer } from "../../../src/models/Offer";

export const withObligatoryData = ({ index, companyUuid }: IWithObligatoryData): IOffer => ({
  companyUuid,
  title: `title${index}`,
  description: `description${index}`,
  hoursPerDay: index + 1,
  minimumSalary: index + 1,
  maximumSalary: 2 * index + 1
});

interface IWithObligatoryData {
  index: number;
  companyUuid: string;
}
