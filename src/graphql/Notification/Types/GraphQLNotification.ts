import { GraphQLUnionType } from "graphql";
import { GraphQLJobApplicationNotification } from "./GraphQLJobApplicationNotification";
import { Notification } from "$models";

export const GraphQLNotification = new GraphQLUnionType({
  name: "Notification",
  types: [GraphQLJobApplicationNotification],
  resolveType(value: Notification) {
    if (value.jobApplicationUuid) return GraphQLJobApplicationNotification;
    throw new Error("Value is not of Notification type");
  }
});
