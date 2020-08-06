import { isAdmin, isUser } from "$graphql/Rules";

export const careersPermissions = {
  Query: {
    getCareerByCode: isUser
  },
  Mutation: {
    saveCareer: isAdmin
  }
};
