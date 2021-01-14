import { nonNull, ID } from "$graphql/fieldTypes";
import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { AdminRepository } from "$models/Admin";

export const activateAdminAccount = {
  type: GraphQLAdmin,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IActivateAdminAccount) => {
    const admin = await AdminRepository.findDeletedByUserUuid(uuid);
    admin.setDataValue("deletedAt", null);
    await AdminRepository.save(admin);
    return admin;
  }
};

interface IActivateAdminAccount {
  uuid: string;
}
