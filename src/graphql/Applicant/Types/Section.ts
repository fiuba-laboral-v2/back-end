import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

const GraphQLSection = new GraphQLInputObjectType({
  name: "Section",
  fields: () => ({
    title: {
      type: nonNull(String)
    },
    description: {
      type: nonNull(String)
    }
  })
});

const GraphQLSectionOutput = new GraphQLObjectType({
  name: "SectionOutput",
  fields: () => ({
    title: {
      type: nonNull(String)
    },
    description: {
      type: nonNull(String)
    }
  })
});

export { GraphQLSection, GraphQLSectionOutput };
