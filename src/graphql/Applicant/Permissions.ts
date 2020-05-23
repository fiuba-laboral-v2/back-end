import { isApplicant, isUser } from "../rules";

export const applicantPermissions = {
  Query: {
    getApplicant: isUser,
    getApplicants: isUser
  },
  Mutation: {
    updateApplicant: isApplicant
  }
};
