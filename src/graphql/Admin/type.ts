import { GraphQLObjectType } from "graphql";
import { ID, Int, String, nonNull } from "../field_types";

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
