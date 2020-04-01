import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String, ID } from "../../fieldTypes";

const GraphQLLinkInput = new GraphQLInputObjectType({
  name: "LinkInput",
  fields: () => ({
    uuid: {
      type: ID
    },
    name: {
      type: nonNull(String)
    },
    url: {
      type: nonNull(String)
    }
  })
});

const GraphQLLink = new GraphQLObjectType({
  name: "Link",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: nonNull(String)
    },
    url: {
      type: nonNull(String)
    }
  })
});

export { GraphQLLinkInput, GraphQLLink };
