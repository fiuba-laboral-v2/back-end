import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt } from "graphql/type/scalars";

export const GraphQLStatistics = new GraphQLObjectType({
  name: "Statistics",
  fields: () => ({
    approvedStudentsCount: {
      type: nonNull(GraphQLInt)
    },
    approvedGraduatesCount: {
      type: nonNull(GraphQLInt)
    },
    approvedCompaniesCount: {
      type: nonNull(GraphQLInt)
    },
    approvedJobApplicationsCount: {
      type: nonNull(GraphQLInt)
    },
    approvedOffersCount: {
      type: nonNull(GraphQLInt)
    }
  })
});
