import { GraphQLObjectType } from "graphql";
import { nonNull, Boolean } from "$graphql/fieldTypes";

export const GraphQLHasUnreadCompanyNotifications = new GraphQLObjectType<{
  hasUnreadNotifications: boolean;
}>({
  name: "HasUnreadCompanyNotifications",
  fields: () => ({
    hasUnreadNotifications: {
      type: nonNull(Boolean)
    }
  })
});
