import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { IApolloServerContext } from "$graphql/Context";
import { CompanyUserRawCredentials, UserRepository } from "$models/User";
import { CompanyUserRepository } from "$models/CompanyUser";

export const updatePassword = {
  type: GraphQLCompanyUser,
  args: {
    oldPassword: {
      type: nonNull(String)
    },
    newPassword: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { oldPassword, newPassword }: IUpdatePassword,
    { currentUser }: IApolloServerContext
  ) => {
    const user = await UserRepository.findByUuid(currentUser.uuid);
    await user.credentials.authenticate(oldPassword);
    user.credentials = new CompanyUserRawCredentials({ password: newPassword });
    await UserRepository.save(user);
    return CompanyUserRepository.findByUserUuidIfExists(currentUser.uuid);
  }
};

export interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}
