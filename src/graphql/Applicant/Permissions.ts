import { isApplicant, isUser } from "../Rules";

export const applicantPermissions = {
  Query: {
    getApplicant: isUser,
    getApplicants: isUser
  },
  Mutation: {
    updateCurrentApplicant: isApplicant
  }
};
