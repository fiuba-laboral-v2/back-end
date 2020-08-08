import { ISaveApplicant } from "$models/Applicant";
import { IApplicantAttributes } from "$generators/interfaces";

export const withMinimumData = (
  {
    index,
    password,
    capabilities,
    careers
  }: IApplicantData
): ICreateApplicant => ({
  padron: index + 1,
  description: `description${index + 1}`,
  careers: careers || [],
  capabilities: capabilities || [],
  user: {
    dni: 10000000 + index,
    email: `applicant${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "applicantName",
    surname: "applicantSurname"
  }
});

export interface IApplicantData extends IApplicantInputData {
  index: number;
}

export type IApplicantInputData = Omit<IApplicantAttributes, "expressContext" | "status">;
