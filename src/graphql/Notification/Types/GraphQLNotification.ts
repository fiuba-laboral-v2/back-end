import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLUser } from "$graphql/User/Types/GraphQLUser";
import { GraphQLAdmin } from "$graphql/Admin/Types/GraphQLAdmin";
import { GraphQLNotificationType } from "./GraphQLNotificationType";
import { Notification } from "$models";
import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { NotificationRepository } from "$models/Notification";

export const GraphQLNotification = new GraphQLObjectType<Notification>({
  name: "Notification",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    message: {
      type: String
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    user: {
      type: nonNull(GraphQLUser),
      resolve: notification => UserRepository.findByUuid(notification.userUuid)
    },
    admin: {
      type: nonNull(GraphQLAdmin),
      resolve: notification => AdminRepository.findByUserUuid(notification.adminUserUuid)
    },
    type: {
      type: nonNull(GraphQLNotificationType),
      resolve: notification => NotificationRepository.getType(notification)
    }
  })
});
