import { IOffer } from "../../../src/models/Offer";
import { IVariables } from "./interfaces";

export const withObligatoryData = (
  {
    index,
    companyUuid,
    careers,
    sections
  }: IVariables
): IOffer => {
  const data = {
    companyUuid,
    title: `title${index}`,
    description: `description${index}`,
    hoursPerDay: index + 1,
    minimumSalary: index + 1,
    maximumSalary: 2 * index + 1,
    extensionApprovalStatus: "pending",
    graduadosApprovalStatus: "pending",
    careers,
    sections
  };
  if (!careers) delete data.careers;
  if (!sections) delete data.sections;
  return data;
};
