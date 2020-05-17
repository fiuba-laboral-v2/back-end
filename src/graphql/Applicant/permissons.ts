import { isApplicant } from "../rules";

export const applicantPermissions = {
  Mutation: {
    updateApplicant: isApplicant
  }
};
