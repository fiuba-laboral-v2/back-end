import { isAuthenticated } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthenticated
  }
};
