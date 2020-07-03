import { isAdmin, isUser } from "../Rules";

export const careersPermissions = {
  Query: {
    getCareerByCode: isUser
  },
  Mutation: {
    saveCareer: isAdmin
  }
};
