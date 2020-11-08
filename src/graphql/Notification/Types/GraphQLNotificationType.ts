import { GraphQLUnionType } from "graphql";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { JobApplication } from "$models";

export const GraphQLNotificationType = new GraphQLUnionType({
  name: "NotificationType",
  types: [GraphQLJobApplication],
  resolveType(value) {
    if (value instanceof JobApplication) return GraphQLJobApplication;
    throw new Error("Value is not of Notification type");
  }
});
