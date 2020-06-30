import { GraphQLObjectType } from "graphql";
import { ID, nonNull } from "../../fieldTypes";
import { Admin } from "../../../models/Admin";

export const GraphQLAdmin = new GraphQLObjectType<Admin>({
  name: "Admin",
  fields: () => ({
    userUuid: {
      type: nonNull(ID)
    }
  })
});