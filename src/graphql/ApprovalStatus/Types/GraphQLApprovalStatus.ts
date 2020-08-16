import { GraphQLEnumType } from "$graphql/GraphQLEnumType";
import { approvalStatuses } from "$models/ApprovalStatus";

export const GraphQLApprovalStatus = GraphQLEnumType({
  name: "ApprovalStatus",
  possibleValues: approvalStatuses,
});
