import { GraphQLObjectType } from "graphql";
import { nonNull, String, ID, Int } from "$graphql/fieldTypes";

export const GraphQLApplicantExperienceSectionType = new GraphQLObjectType({
  name: "ApplicantExperienceSection",
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
