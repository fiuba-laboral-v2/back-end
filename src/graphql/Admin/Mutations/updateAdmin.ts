import { nonNull, ID } from "$graphql/fieldTypes";
import { GraphQLUserUpdateInput } from "$graphql/User/Types/GraphQLUserUpdateInput";
import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { GraphQLSecretary } from "../Types/GraphQLSecretary";

import { Database } from "$config";
import { UserRepository } from "$models/User";
import { Secretary, AdminRepository } from "$models/Admin";

export const updateAdmin = {
  type: GraphQLAdmin,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    user: {
      type: nonNull(GraphQLUserUpdateInput)
    },
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  },
  resolve: async (_: undefined, { uuid, secretary, user: userAttributes }: IUpdateAdmin) => {
    const user = await UserRepository.findByUuid(uuid);
    const admin = await AdminRepository.findByUserUuid(uuid);
    user.setAttributes(userAttributes);
    admin.set({ secretary });

    return Database.transaction(async transaction => {
      await UserRepository.save(user, transaction);
      await AdminRepository.save(admin, transaction);
      return admin;
    });
  }
};

export interface IUpdateAdmin {
  uuid: string;
  user: {
    email: string;
    name: string;
    surname: string;
  };
  secretary: Secretary;
}
