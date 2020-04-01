import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String, ID, Int } from "../../fieldTypes";

const GraphQLSectionInput = new GraphQLInputObjectType({
  name: "SectionInput",
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

const GraphQLSection = new GraphQLObjectType({
  name: "Section",
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

export { GraphQLSectionInput, GraphQLSection };
