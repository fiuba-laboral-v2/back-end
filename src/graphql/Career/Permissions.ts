import { isUser } from "../rules";

export const careersPermissions = {
  Query: {
    getCareerByCode: isUser
  }
  // Mutation: {
  //   saveCareer: isAdmin
  // }
};
