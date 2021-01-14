import { GraphQLObjectType } from "graphql";
import { nonNull, Boolean } from "$graphql/fieldTypes";

export const GraphQLHasUnreadAdminNotifications = new GraphQLObjectType<{
  hasUnreadNotifications: boolean;
}>({
  name: "HasUnreadAdminNotifications",
  fields: () => ({
    hasUnreadNotifications: {
      type: nonNull(Boolean)
    }
  })
});
