import { GraphQLObjectType } from "graphql";
import { ID, nonNull, String } from "$graphql/fieldTypes";

const GraphQLCareer = new GraphQLObjectType({
  name: "Career",
  fields: () => ({
    code: {
      type: nonNull(ID)
    },
    description: {
      type: nonNull(String)
    }
  })
});

export { GraphQLCareer };
