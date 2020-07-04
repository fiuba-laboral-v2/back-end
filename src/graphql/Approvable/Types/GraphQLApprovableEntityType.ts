import { GraphQLEnumType } from "../../GraphQLEnumType";
import { ApprovableEntityType } from "../../../models/Approvable";

export const GraphQLApprovableEntityType = GraphQLEnumType({
  name: "ApprovableEntityType",
  values: Object.keys(ApprovableEntityType)
});
