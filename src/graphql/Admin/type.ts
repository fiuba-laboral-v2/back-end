import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String } from "../fieldTypes";

const adminType = new GraphQLObjectType({
  name: "Admin",
  fields: () => ({
    id: {
      type: ID
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    age: {
      type: Int
    }
  })
});

export default adminType;
