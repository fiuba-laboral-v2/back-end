import { GraphQLEnumType as Enum } from "graphql";
import Maybe from "graphql/tsutils/Maybe";
import { EnumTypeDefinitionNode, EnumTypeExtensionNode } from "graphql/language/ast";

export const GraphQLEnumType = (config: IGraphQLEnumTypeConfig) => new Enum({
  ...config,
  values: (() => {
    const values = {};
    config.values.forEach(status => values[status] = { value: status });
    return values;
  })()
});

interface IGraphQLEnumTypeConfig {
  values: string[];
  name: string;
  description?: Maybe<string>;
  extensions?: Maybe<Readonly<Record<string, any>>>;
  astNode?: Maybe<EnumTypeDefinitionNode>;
  extensionASTNodes?: Maybe<ReadonlyArray<EnumTypeExtensionNode>>;
}
