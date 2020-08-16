import { isUser } from "../Rules";

export const userPermissions = {
  Mutation: {
    logout: isUser,
  },
};
