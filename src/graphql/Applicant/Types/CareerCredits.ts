import { GraphQLInputObjectType } from "graphql";
import { Int, nonNull, String, Boolean } from "$graphql/fieldTypes";

export const GraphQLCareerCredits = new GraphQLInputObjectType({
  name: "CareerCredits",
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
