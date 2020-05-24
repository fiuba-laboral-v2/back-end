import { isUser } from "../rules";

export const careersPermissions = {
  Query: {
    getCareerByCode: isUser,
    getCareers: isUser
  }
  // Mutation: {
  //   saveCareer: isAdmin
  // }
};
