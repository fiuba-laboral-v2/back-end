import { GraphQLUnionType } from "graphql";
import { GraphQLJobApplicationNotification } from "./GraphQLJobApplicationNotification";
import { Notification } from "$models";
import { MissingNotificationTypeError } from "$models/Notification";

export const GraphQLNotification = new GraphQLUnionType({
  name: "Notification",
  types: [GraphQLJobApplicationNotification],
  resolveType(value: Notification) {
    if (value.jobApplicationUuid) return GraphQLJobApplicationNotification;
    throw new MissingNotificationTypeError();
  }
});
