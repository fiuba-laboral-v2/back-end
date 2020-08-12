import { GraphQLInputObjectType } from "graphql";
import { Int, nonNull, String, Boolean } from "$graphql/fieldTypes";

export const GraphQLApplicantCareerInput = new GraphQLInputObjectType({
  name: "ApplicantCareerInput",
  fields: () => ({
    code: {
      type: nonNull(String)
    },
    creditsCount: {
      type: nonNull(Int)
    },
    isGraduate: {
      type: nonNull(Boolean)
    }
  })
});
