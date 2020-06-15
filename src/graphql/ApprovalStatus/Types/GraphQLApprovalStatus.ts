import { GraphQLEnumType } from "../../GraphQLEnumType";
import { approvalStatuses } from "../../../models/ApprovalStatus";

export const GraphQLApprovalStatus = GraphQLEnumType({
  name: "ApprovalStatus",
  enumValues: approvalStatuses
});
