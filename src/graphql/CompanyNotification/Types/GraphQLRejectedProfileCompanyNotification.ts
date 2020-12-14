import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { RejectedProfileCompanyNotification } from "$models/CompanyNotification";

export const GraphQLRejectedProfileCompanyNotification = new GraphQLObjectType<
  RejectedProfileCompanyNotification
>({
  name: "RejectedProfileCompanyNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    moderatorMessage: {
      type: nonNull(String)
    }
  })
});
