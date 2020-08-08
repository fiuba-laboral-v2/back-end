import { ISaveApplicant } from "$models/Applicant";

export const withMinimumData = (index: number): ISaveApplicant => ({
  padron: index + 1,
  description: `description${index + 1}`,
  careers: [],
  user: {
    dni: 10000000 + index,
    email: `applicant${index}@mail.com`,
    password: "ASDqfdsfsdfwe234",
    name: "applicantName",
    surname: "applicantSurname"
  }
});
