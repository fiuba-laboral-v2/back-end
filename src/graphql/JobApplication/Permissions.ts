import { isApplicant } from "../rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApplicant
  }
};
