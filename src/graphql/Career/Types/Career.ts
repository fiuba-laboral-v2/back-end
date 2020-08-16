import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String } from "$graphql/fieldTypes";

const GraphQLCareer = new GraphQLObjectType({
  name: "Career",
  fields: () => ({
    code: {
      type: nonNull(ID),
    },
    description: {
      type: nonNull(String),
    },
    credits: {
      type: Int,
    },
  }),
});

export { GraphQLCareer };
