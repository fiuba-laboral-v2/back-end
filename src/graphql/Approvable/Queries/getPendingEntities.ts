import { List, nonNull } from "../../fieldTypes";
import { ApprovableRepository } from "../../../models/Approvable";
import { IApprovableFilterOptions } from "../../../models/Approvable/Interfaces";
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
