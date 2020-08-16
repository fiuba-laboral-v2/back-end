import { GraphQLObjectType, GraphQLUnionType } from "graphql";
import { Boolean, List, nonNull } from "$graphql/fieldTypes";

export const GraphQLPaginatedResults = (resultType: GraphQLObjectType | GraphQLUnionType) =>
  new GraphQLObjectType({
    name: `Paginated${resultType.name}`,
    fields: () => ({
      shouldFetchMore: {
        type: nonNull(Boolean),
      },
      results: {
        type: nonNull(List(nonNull(resultType))),
      },
    }),
  });
