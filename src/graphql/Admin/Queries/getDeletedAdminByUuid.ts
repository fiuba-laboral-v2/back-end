import { nonNull, ID } from "../../fieldTypes";
import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { AdminRepository } from "$src/models/Admin";

export const getDeletedAdminByUuid = {
  type: GraphQLAdmin,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }: { uuid: string }) => AdminRepository.findDeletedByUserUuid(uuid)
};
