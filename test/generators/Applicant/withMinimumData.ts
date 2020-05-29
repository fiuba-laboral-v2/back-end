import { IApplicant } from "../../../src/models/Applicant";

export const withMinimumData = (index: number): IApplicant => {
  return {
    padron: index + 1,
    careers: [],
    user: {
      email: `applicant${index}@mail.com`,
      password: "ASDqfdsfsdfwe234",
      name: "applicantName",
      surname: "applicantSurname"
    }
  };
};
