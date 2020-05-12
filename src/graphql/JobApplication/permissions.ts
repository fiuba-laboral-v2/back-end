import { and } from "graphql-shield";
import { isAuthenticated, isApplicant } from "../rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: and(isAuthenticated, isApplicant)
  }
};
