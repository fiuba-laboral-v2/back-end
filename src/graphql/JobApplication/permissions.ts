import { isAuthenticated } from "../rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isAuthenticated
  }
};
