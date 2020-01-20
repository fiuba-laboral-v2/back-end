import { GraphQLObjectType } from "graphql";
import { ID, Int, String, nonNull } from "../field_types";

const studentType = new GraphQLObjectType({
  name: "Student",
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

export default studentType;
