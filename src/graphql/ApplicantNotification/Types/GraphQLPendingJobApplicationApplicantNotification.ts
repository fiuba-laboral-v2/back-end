import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLGenericApplicantNotificationFields } from "./GraphQLGenericApplicantNotificationFields";
import { PendingJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLPendingJobApplicationApplicantNotification = new GraphQLObjectType<
  PendingJobApplicationApplicantNotification
>({
  name: "PendingJobApplicationApplicantNotification",
  fields: () => ({
    ...GraphQLGenericApplicantNotificationFields,
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
