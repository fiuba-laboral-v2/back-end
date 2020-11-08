import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLUser } from "$graphql/User/Types/GraphQLUser";
import { GraphQLAdmin } from "$graphql/Admin/Types/GraphQLAdmin";
import { GraphQLNotificationType } from "./GraphQLNotificationType";
import { Notification } from "$models";
import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLNotification = new GraphQLObjectType<Notification>({
  name: "Notification",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
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
      resolve: notification => {
        if (notification.jobApplicationUuid) {
          return JobApplicationRepository.findByUuid(notification.jobApplicationUuid);
        }
        throw new Error("Value is not of Notification type");
      }
    },
    message: {
      type: String
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});
