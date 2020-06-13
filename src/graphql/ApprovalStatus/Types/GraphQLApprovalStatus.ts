import { GraphQLEnumType } from "graphql";
import { approvalStatuses } from "../../../models/ApprovalStatus";

const buildEnumValues = () => {
  const values = {};
  approvalStatuses.forEach(status => {
    values[status] = { value: status };
  });
  return values;
};

export const GraphQLApprovalStatus = new GraphQLEnumType({
  name: "ApprovalStatus",
  values: buildEnumValues()
});
