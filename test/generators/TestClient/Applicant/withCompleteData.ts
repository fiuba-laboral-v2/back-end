import { ISaveApplicant } from "$models/Applicant";
import { IApplicantAttributes } from "$generators/interfaces";

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
    dni: 20000000 + index,
    email: `applicantTestClient${index}@mail.com`,
    password: password || "ASDqfdsfsdfwe234",
    name: "applicantName",
    surname: "applicantSurname"
  }
});

interface IWithCompleteData extends Omit<IApplicantAttributes, "expressContext" | "status"> {
  index: number;
}
