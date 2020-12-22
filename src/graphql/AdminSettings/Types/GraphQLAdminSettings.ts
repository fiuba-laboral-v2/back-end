import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";
import { AdminSettings } from "$models/AdminSettings";

export const GraphQLAdminSettings = new GraphQLObjectType<AdminSettings>({
  name: "AdminSettings",
  fields: () => ({
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    },
    email: {
      type: nonNull(GraphQLString)
    }
  })
});
