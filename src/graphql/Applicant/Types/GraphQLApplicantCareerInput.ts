import { GraphQLInputObjectType } from "graphql";
import { Int, nonNull, String, Boolean } from "$graphql/fieldTypes";

export const GraphQLApplicantCareerInput = new GraphQLInputObjectType({
  name: "ApplicantCareerInput",
  fields: () => ({
    careerCode: {
      type: nonNull(String)
    },
    approvedSubjectCount: {
      type: Int
    },
    currentCareerYear: {
      type: Int
    },
    isGraduate: {
      type: nonNull(Boolean)
    }
  })
});
