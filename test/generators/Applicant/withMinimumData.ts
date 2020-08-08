import { ISaveApplicant } from "$models/Applicant";
import { IApplicantGeneratorAttributes } from "$generators/interfaces";
import { DniGenerator } from "$generators/DNI";

export const withMinimumData = (
  {
    index,
    password,
    capabilities,
    careers
  }: IApplicantData
): ISaveApplicant => ({
  padron: index + 1,
  description: `description${index + 1}`,
  careers: careers || [],
  capabilities: capabilities || [],
  user: {
    dni: DniGenerator.generate(),
    email: `applicant${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "applicantName",
    surname: "applicantSurname"
  }
});

export interface IApplicantData extends IApplicantInputData {
  index: number;
}

export type IApplicantInputData = IApplicantGeneratorAttributes;
