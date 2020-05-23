import { isUser } from "../rules";

export const userPermissions = {
  Query: {
    me: isUser
  }
};
