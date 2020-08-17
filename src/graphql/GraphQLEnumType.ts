import { GraphQLEnumType as Enum } from "graphql";

export const GraphQLEnumType = ({ possibleValues, name }: IGraphQLEnumTypeConfig) =>
  new Enum({
    name,
    values: (() => {
      const values = {};
      possibleValues.forEach(status => (values[status] = { value: status }));
      return values;
    })()
  });

interface IGraphQLEnumTypeConfig {
  name: string;
  possibleValues: string[];
}
