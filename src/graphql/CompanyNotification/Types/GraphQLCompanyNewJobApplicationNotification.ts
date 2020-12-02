import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLGenericCompanyNotificationFields } from "./GraphQLGenericCompanyNotificationFields";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLCompanyNewJobApplicationNotification = new GraphQLObjectType<
  CompanyNewJobApplicationNotification
>({
  name: "CompanyNewJobApplicationNotification",
  fields: () => ({
    ...GraphQLGenericCompanyNotificationFields,
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
