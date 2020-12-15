import { GraphQLUnionType } from "graphql";
import { GraphQLUpdatedCompanyProfileAdminNotification } from "./GraphQLUpdatedCompanyProfileAdminNotification";
import { UnknownNotificationError } from "$models/Notification";
import {
  AdminNotification,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";

export const GraphQLAdminNotification = new GraphQLUnionType({
  name: "AdminNotification",
  types: [GraphQLUpdatedCompanyProfileAdminNotification],
  resolveType(notification: AdminNotification) {
    const className = notification.constructor.name;
    switch (className) {
      case UpdatedCompanyProfileAdminNotification.name:
        return GraphQLUpdatedCompanyProfileAdminNotification;
    }
    throw new UnknownNotificationError(className);
  }
});
