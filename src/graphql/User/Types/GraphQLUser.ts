import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "../../fieldTypes";

const GraphQLUser = new GraphQLObjectType({
  name: "User",
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

export { GraphQLUser };
