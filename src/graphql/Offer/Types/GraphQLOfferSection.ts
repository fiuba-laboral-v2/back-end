import { GraphQLInputObjectType, GraphQLObjectType } from "graphql";
import { nonNull, String, ID, Int } from "$graphql/fieldTypes";

const GraphQLOfferSectionInput = new GraphQLInputObjectType({
  name: "OfferSectionInput",
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

const GraphQLOfferSection = new GraphQLObjectType({
  name: "OfferSection",
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

export { GraphQLOfferSectionInput, GraphQLOfferSection };
