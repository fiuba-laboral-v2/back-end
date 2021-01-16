import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt } from "graphql/type/scalars";

export const GraphQLStatistics = new GraphQLObjectType({
  name: "Statistics",
  fields: () => ({
    amountOfStudents: {
      type: nonNull(GraphQLInt)
    },
    amountOfGraduates: {
      type: nonNull(GraphQLInt)
    },
    amountOfCompanies: {
      type: nonNull(GraphQLInt)
    },
    amountOfJobApplications: {
      type: nonNull(GraphQLInt)
    },
    amountOfOffers: {
      type: nonNull(GraphQLInt)
    }
  })
});
