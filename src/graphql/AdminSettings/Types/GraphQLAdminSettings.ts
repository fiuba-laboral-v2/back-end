import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";
import { SecretarySettings } from "$models";

export const GraphQLAdminSettings = new GraphQLObjectType<SecretarySettings>({
  name: "AdminSettings",
  fields: () => ({
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    },
    email: {
      type: nonNull(GraphQLString)
    },
    emailSignature: {
      type: nonNull(GraphQLString)
    }
  })
});
