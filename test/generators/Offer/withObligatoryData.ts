import { IVariables } from "./interfaces";
import { IOfferAttributes } from "$models/Offer/Interface";
import { ApplicantType } from "$models/Applicant";

export const withObligatoryData = ({
  index,
  companyUuid,
  careers,
  sections,
  targetApplicantType,
  isInternship = false,
  maximumSalary
}: IVariables): IOfferAttributes => ({
  companyUuid,
  title: `title${index}`,
  description: `description${index}`,
  hoursPerDay: index + 1,
  isInternship,
  minimumSalary: index + 1,
  maximumSalary: maximumSalary !== undefined ? maximumSalary || undefined : 2 * index + 1,
  targetApplicantType: targetApplicantType || ApplicantType.both,
  careers: careers || [],
  sections: sections || []
});
