import { GraphQLEnumType as Enum, GraphQLEnumTypeConfig } from "graphql";

export const GraphQLEnumType = (config: GraphQLEnumTypeProps) => new Enum({
  ...config,
  values: (() => {
    const values = {};
    config.values.forEach(status => values[status] = { value: status });
    return values;
  })()
});
type GraphQLEnumTypeProps = GraphQLEnumTypeConfig & { values: string[] };
