import { nonNull } from "$graphql/fieldTypes";
import { GraphQLUserCreateInput } from "$graphql/User/Types/GraphQLUserCreateInput";
import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { GraphQLSecretary } from "../Types/GraphQLSecretary";

import { Database } from "$config";
import { UserRepository, User, ICreateFiubaUser, UserNotFoundError } from "$models/User";
import { FiubaCredentials } from "$models/User/Credentials";
import { Secretary, AdminRepository } from "$models/Admin";
import { Admin } from "$models";

export const saveAdmin = {
  type: GraphQLAdmin,
  args: {
    user: {
      type: nonNull(GraphQLUserCreateInput)
    },
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  },
  resolve: async (_: undefined, { secretary, user: userAttributes }: ISaveAdmin) => {
    const { name, surname, email, dni, password } = userAttributes;
    let user: User;
    try {
      user = await UserRepository.findFiubaUserByDni(dni);
    } catch (error) {
      if (!(error instanceof UserNotFoundError)) throw error;
      user = new User({ name, surname, email, credentials: new FiubaCredentials(dni) });
    }
    await user.credentials.authenticate(password);
    const admin = new Admin({ secretary });

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      admin.userUuid = user.uuid!;
      await AdminRepository.save(admin, transaction);
      return admin;
    });
  }
};

export interface ISaveAdmin {
  user: ICreateFiubaUser;
  secretary: Secretary;
}
