import { List } from "../../fieldTypes";
import { ApprovableRepository } from "../../../models/Approvable";
import { GraphQLApprovable } from "../Types/GraphQLApprovable";

export const getPendingEntities = {
  type: List(GraphQLApprovable),
  resolve: () => ApprovableRepository.findPending()
};
