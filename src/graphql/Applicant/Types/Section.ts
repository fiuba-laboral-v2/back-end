import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String, ID, Int } from "../../fieldTypes";

const GraphQLSection = new GraphQLInputObjectType({
  name: "Section",
  fields: () => ({
    uuid: {
      type: ID
    },
    title: {
      type: nonNull(String)
    },
    text: {
      type: nonNull(String)
    },
    displayOrder: {
      type: Int
    }
  })
});

const GraphQLSectionOutput = new GraphQLObjectType({
  name: "SectionOutput",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    title: {
      type: nonNull(String)
    },
    text: {
      type: nonNull(String)
    },
    displayOrder: {
      type: nonNull(Int)
    }
  })
});

export { GraphQLSection, GraphQLSectionOutput };
