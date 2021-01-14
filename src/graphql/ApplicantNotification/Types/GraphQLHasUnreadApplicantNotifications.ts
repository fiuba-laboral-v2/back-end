import { GraphQLObjectType } from "graphql";
import { nonNull, Boolean } from "$graphql/fieldTypes";

export const GraphQLHasUnreadApplicantNotifications = new GraphQLObjectType<{
  hasUnreadNotifications: boolean;
}>({
  name: "HasUnreadApplicantNotifications",
  fields: () => ({
    hasUnreadNotifications: {
      type: nonNull(Boolean)
    }
  })
});
