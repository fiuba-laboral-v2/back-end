import { ISaveApplicant } from "$models/Applicant";
import { IApplicantGeneratorAttributes } from "$generators/interfaces";
import { DniGenerator } from "$generators/DNI";

export const withCompleteData = (
  {
    index,
    password,
    capabilities,
    careers
  }: IWithCompleteData
): ISaveApplicant => ({
  padron: index + 1,
  description: `description${index + 1}`,
  careers: careers || [],
  capabilities: capabilities || [],
  user: {
    dni: DniGenerator.generate(),
    email: `applicantTestClient${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "applicantName",
    surname: "applicantSurname"
  }
});

interface IWithCompleteData extends IApplicantGeneratorAttributes {
  index: number;
}
