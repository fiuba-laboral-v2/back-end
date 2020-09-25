import { GraphQLAdmin } from "../Types/GraphQLAdmin";
import { AdminRepository } from "$src/models/Admin";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";

const getAdmins = {
  type: GraphQLPaginatedResults(GraphQLAdmin),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    AdminRepository.findLatest(updatedBeforeThan)
};

export { getAdmins };
