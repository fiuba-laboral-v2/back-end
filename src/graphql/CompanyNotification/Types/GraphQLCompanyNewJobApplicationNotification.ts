import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLCompanyNewJobApplicationNotification = new GraphQLObjectType<
  CompanyNewJobApplicationNotification
>({
  name: "CompanyNewJobApplicationNotification",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    isNew: {
      type: nonNull(Boolean)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    adminEmail: {
      type: nonNull(String),
      resolve: async notification => {
        const user = await UserRepository.findByUuid(notification.moderatorUuid);
        return user.email;
      }
    },
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
