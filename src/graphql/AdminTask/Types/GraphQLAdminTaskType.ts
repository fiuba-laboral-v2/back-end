import { GraphQLEnumType } from "../../GraphQLEnumType";
import { AdminTaskType } from "../../../models/Approvable";

export const GraphQLAdminTaskType = GraphQLEnumType({
  name: "AdminTaskType",
  values: Object.keys(AdminTaskType)
});
