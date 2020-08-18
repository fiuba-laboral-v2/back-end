import { IVariables } from "./interfaces";
import { IOfferAttributes, TargetApplicantType } from "$models/Offer/Interface";

export const withObligatoryData = ({
  index,
  companyUuid,
  careers,
  sections,
  target
}: IVariables): IOfferAttributes => {
  const data = {
    companyUuid,
    title: `title${index}`,
    description: `description${index}`,
    hoursPerDay: index + 1,
    minimumSalary: index + 1,
    maximumSalary: 2 * index + 1,
    target: target || TargetApplicantType.both,
    careers,
    sections
  };
  if (!careers) delete data.careers;
  if (!sections) delete data.sections;
  return data;
};
