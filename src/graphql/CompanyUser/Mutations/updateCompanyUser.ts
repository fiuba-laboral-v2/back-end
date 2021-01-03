import { nonNull } from "$graphql/fieldTypes";
import { GraphQLCompanyUserUpdateInput } from "$graphql/User/Types/GraphQLCompanyUserUpdateInput";
import { GraphQLCompanyUser } from "../Types/GraphQLCompanyUser";

import { Database } from "$config";
import { UserRepository } from "$models/User";
import { CompanyUserRepository } from "$models/CompanyUser";

export const updateCompanyUser = {
  type: GraphQLCompanyUser,
  args: {
    user: {
      type: nonNull(GraphQLCompanyUserUpdateInput)
    }
  },
  resolve: async (
    _: undefined,
    { user: { uuid, name, surname, email, position } }: IUpdateCompanyUser
  ) => {
    const user = await UserRepository.findByUuid(uuid);
    const companyUser = await CompanyUserRepository.findByUserUuid(uuid);
    user.setName(name);
    user.setSurname(surname);
    user.setEmail(email);
    companyUser.set({ position });

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      await CompanyUserRepository.save(companyUser, transaction);
      return companyUser;
    });
  }
};

export interface IUpdateCompanyUser {
  user: {
    uuid: string;
    name: string;
    surname: string;
    email: string;
    position: string;
  };
}
