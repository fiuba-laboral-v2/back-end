import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";

const GraphQLTranslation = new GraphQLObjectType({
  name: "Translation",
  fields: () => ({
    key: {
      type: nonNull(String)
    },
    value: {
      type: nonNull(String)
    }
  })
});

export { GraphQLTranslation };
