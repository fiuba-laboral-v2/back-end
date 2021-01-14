import { GraphQLObjectType, GraphQLUnionType, GraphQLFieldConfigMap } from "graphql";
import { Boolean, List, nonNull } from "$graphql/fieldTypes";

const types = {};

export const GraphQLPaginatedResults = (
  resultType: GraphQLObjectType | GraphQLUnionType,
  extraFields?: GraphQLFieldConfigMap<any, any>
) => {
  const resultTypeName = resultType.name;
  if (!types[resultTypeName]) {
    types[resultTypeName] = new GraphQLObjectType({
      name: `Paginated${resultTypeName}`,
      fields: () => ({
        shouldFetchMore: {
          type: nonNull(Boolean)
        },
        results: {
          type: nonNull(List(nonNull(resultType)))
        },
        ...extraFields
      })
    });
  }
  return types[resultTypeName];
};
