import { List, nonNull } from "../../fieldTypes";
import { ApprovableRepository, IApprovableFilterOptions } from "../../../models/Approvable";
import { GraphQLApprovable } from "../Types/GraphQLApprovable";
import { GraphQLApprovableEntityType } from "../Types/GraphQLApprovableEntityType";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";

export const getApprovables = {
  type: nonNull(List(GraphQLApprovable)),
  args: {
    approvableEntityTypes: {
      type: nonNull(List(GraphQLApprovableEntityType))
    },
    statuses: {
      type: nonNull(List(GraphQLApprovalStatus))
    }
  },
  resolve: (_: undefined, options: IApprovableFilterOptions) =>
    ApprovableRepository.findApprovables(options)
};
