import { nonNull } from "$graphql/fieldTypes";
import { GraphQLUserCreateInput } from "$graphql/User/Types/GraphQLUserCreateInput";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { UserRepository, CompanyUserRawCredentials, User, ICreateCompanyUser } from "$models/User";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CompanyUser } from "$models";

export const saveCompanyUser = {
  type: GraphQLCompanyUser,
  args: {
    user: {
      type: nonNull(GraphQLUserCreateInput)
    }
  },
  resolve: async (
    _: undefined,
    { user: userAttributes }: ISaveCompanyUser,
    { currentUser }: IApolloServerContext
  ) => {
    const { companyUuid } = currentUser.getCompanyRole();
    const { name, surname, email, password } = userAttributes;
    const credentials = new CompanyUserRawCredentials({ password });
    const user = new User({ name, surname, email, credentials });

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      const companyUser = new CompanyUser({ companyUuid, userUuid: user.uuid });
      await CompanyUserRepository.save(companyUser, transaction);
      return companyUser;
    });
  }
};

export interface ISaveCompanyUser {
  user: ICreateCompanyUser;
}
