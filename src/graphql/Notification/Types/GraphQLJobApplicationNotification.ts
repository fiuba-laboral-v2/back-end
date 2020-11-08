import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { Notification } from "$models";
import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLJobApplicationNotification = new GraphQLObjectType<Notification>({
  name: "JobApplicationNotification",
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
    adminEmail: {
      type: nonNull(String),
      resolve: async notification => {
        const admin = await AdminRepository.findByUserUuid(notification.adminUserUuid);
        const user = await UserRepository.findByUuid(admin.userUuid);
        return user.email;
      }
    },
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
