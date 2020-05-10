import { allow } from "graphql-shield";
// import { isAuthenticated } from "../rules";

export const jobApplicationPermissions = {
  Query: {
    me: allow
  },
  Mutation: {
    login: allow
  }
};
