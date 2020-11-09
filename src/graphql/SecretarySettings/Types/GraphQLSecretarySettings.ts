import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { SecretarySettings } from "$models";
import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";
import { GraphQLInt } from "graphql/type/scalars";

export const GraphQLSecretarySettings = new GraphQLObjectType<SecretarySettings>({
  name: "SecretarySettings",
  fields: () => ({
    secretary: {
      type: nonNull(GraphQLSecretary)
    },
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    }
  })
});
