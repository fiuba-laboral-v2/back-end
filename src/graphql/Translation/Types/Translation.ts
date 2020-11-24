import { GraphQLScalarType } from "graphql";

export const GraphQLTranslation = new GraphQLScalarType({
  name: "Translation",
  serialize: (translations: object) => translations
});
