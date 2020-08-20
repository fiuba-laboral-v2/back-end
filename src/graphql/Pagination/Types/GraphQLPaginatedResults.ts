import { GraphQLObjectType, GraphQLUnionType } from "graphql";
import { Boolean, List, nonNull } from "$graphql/fieldTypes";

const types = {};

export const GraphQLPaginatedResults = (resultType: GraphQLObjectType | GraphQLUnionType) => {
  const resultTypeName = resultType.name;
  if (!types[resultTypeName]) {
    types[resultTypeName] = new GraphQLObjectType({
      name: `Paginated${resultType.name}`,
      fields: () => ({
        shouldFetchMore: {
          type: nonNull(Boolean)
        },
        results: {
          type: nonNull(List(nonNull(resultType)))
        }
      })
    });
  }
  return types[resultTypeName];
};
