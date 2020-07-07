import { List, nonNull } from "../../fieldTypes";
import { ApprovableRepository, IApprovableFilterOptions } from "../../../models/Approvable";
import { GraphQLApprovable } from "../Types/GraphQLApprovable";
import { GraphQLApprovableEntityType } from "../Types/GraphQLApprovableEntityType";

export const getPendingEntities = {
  type: nonNull(List(GraphQLApprovable)),
  args: {
    approvableEntityTypes: {
      type: nonNull(List(GraphQLApprovableEntityType))
    }
  },
  resolve: (_: undefined, options: IApprovableFilterOptions) =>
    ApprovableRepository.findPending(options)
};
