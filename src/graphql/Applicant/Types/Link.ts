import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";

const GraphQLLinkInput = new GraphQLInputObjectType({
  name: "LinkInput",
  fields: () => ({
    name: {
      type: nonNull(String),
    },
    url: {
      type: nonNull(String),
    },
  }),
});

const GraphQLLink = new GraphQLObjectType({
  name: "Link",
  fields: () => ({
    name: {
      type: nonNull(String),
    },
    url: {
      type: nonNull(String),
    },
  }),
});

export { GraphQLLinkInput, GraphQLLink };
