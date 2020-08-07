import { GraphQLObjectType } from "graphql";
import { Int, nonNull, String, ID } from "$graphql/fieldTypes";

const GraphQLApplicantCareer = new GraphQLObjectType({
  name: "ApplicantCareer",
  fields: () => ({
    code: {
      type: nonNull(ID)
    },
    description: {
      type: nonNull(String)
    },
    credits: {
      type: Int
    },
    creditsCount: {
      type: nonNull(Int)
    }
  })
});

export { GraphQLApplicantCareer };
