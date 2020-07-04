import { List } from "../../fieldTypes";
import { ApprovableRepository } from "../../../models/Approvable";
import { IApprovableFilterOptions } from "../../../models/Approvable/Interfaces";
import { GraphQLApprovable } from "../Types/GraphQLApprovable";
import { GraphQLApprovableEntityType } from "../Types/GraphQLApprovableEntityType";

export const getPendingEntities = {
  type: List(GraphQLApprovable),
  args: {
    approvableEntityTypes: {
      type: List(GraphQLApprovableEntityType)
    }
  },
  resolve: (_: undefined, options: IApprovableFilterOptions) =>
    ApprovableRepository.findPending(options)
};
