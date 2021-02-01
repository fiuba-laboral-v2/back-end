import { nonNull } from "$graphql/fieldTypes";
import { GraphQLCompanyUserCreateInput } from "$graphql/User/Types/GraphQLCompanyUserCreateInput";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { UserRepository, User, ICreateCompanyUser } from "$models/User";
import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { CompanyUserRepository } from "$models/CompanyUser";
import { CompanyUser } from "$models";

export const saveCompanyUser = {
  type: GraphQLCompanyUser,
  args: {
    user: {
      type: nonNull(GraphQLCompanyUserCreateInput)
    }
  },
  resolve: async (
    _: undefined,
    { user: userAttributes }: ISaveCompanyUser,
    { currentUser }: IApolloServerContext
  ) => {
    const { companyUuid } = currentUser.getCompanyRole();
    const { name, surname, email, password, position } = userAttributes;
    const credentials = new CompanyUserRawCredentials({ password });
    const user = new User({ name, surname, email, credentials });

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      const companyUser = new CompanyUser({ companyUuid, userUuid: user.uuid, position });
      await CompanyUserRepository.save(companyUser, transaction);
      return companyUser;
    });
  }
};

export interface ISaveCompanyUser {
  user: ICreateCompanyUser;
}
