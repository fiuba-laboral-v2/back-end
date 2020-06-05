import { isUser } from "../rules";

export const userPermissions = {
  Mutation: {
    logout: isUser
  }
};
