// import { allow } from "graphql-shield";
import { isAuthenticated } from "../rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isAuthenticated
  }
};
