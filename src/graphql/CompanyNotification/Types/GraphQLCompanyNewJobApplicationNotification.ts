import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLCompanyNewJobApplicationNotification = new GraphQLObjectType<
  NewJobApplicationCompanyNotification
>({
  name: "NewJobApplicationCompanyNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
