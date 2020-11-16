import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { Notification } from "$models";
import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLJobApplicationNotification = new GraphQLObjectType<Notification>({
  name: "JobApplicationNotification",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    isNew: {
      type: nonNull(Boolean)
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
        const user = await UserRepository.findByUuid(notification.senderUuid);
        return user.email;
      }
    },
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
