import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "../../fieldTypes";
import { User } from "../../../models/User";

export const GraphQLCompanyUser = new GraphQLObjectType<User>({
  name: "CompanyUser",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    email: {
      type: nonNull(String)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    }
  })
});
