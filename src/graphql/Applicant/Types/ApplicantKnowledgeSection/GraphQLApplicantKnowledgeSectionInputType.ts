import { GraphQLInputObjectType } from "graphql";
import { nonNull, String, ID, Int } from "$graphql/fieldTypes";

export const GraphQLApplicantKnowledgeSectionInputType = new GraphQLInputObjectType({
  name: "ApplicantKnowledgeSectionInput",
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
