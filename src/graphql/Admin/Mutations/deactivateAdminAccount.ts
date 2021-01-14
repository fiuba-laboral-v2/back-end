import { nonNull, ID } from "$graphql/fieldTypes";
import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { AdminRepository } from "$models/Admin";

export const deactivateAdminAccount = {
  type: GraphQLAdmin,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IDeactivateAdminAccount) => {
    const admin = await AdminRepository.findByUserUuid(uuid);
    await AdminRepository.delete(admin);
    return admin;
  }
};

interface IDeactivateAdminAccount {
  uuid: string;
}
