import { GraphQLUser } from "./GraphQLUser";
import { GraphQLUserCreateInput } from "./GraphQLUserCreateInput";
import { GraphQLUserUpdateInput } from "./GraphQLUserUpdateInput";
import { GraphQLCompanyUserCreateInput } from "./GraphQLCompanyUserCreateInput";
import { GraphQLCompanyUserUpdateInput } from "./GraphQLCompanyUserUpdateInput";

export const userTypes = [
  GraphQLUser,
  GraphQLUserCreateInput,
  GraphQLUserUpdateInput,
  GraphQLCompanyUserCreateInput,
  GraphQLCompanyUserUpdateInput
];
