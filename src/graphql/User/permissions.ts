// import { and } from "graphql-shield";
import { isAuthenticated } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthenticated
  },
  Mutation: {
    login: isAuthenticated
  }
};
