import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLGenericApplicantNotificationFields } from "./GraphQLGenericApplicantNotificationFields";

import { RejectedJobApplicationApplicantNotification } from "$models/ApplicantNotification";

import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLRejectedJobApplicationApplicantNotification = new GraphQLObjectType<
  RejectedJobApplicationApplicantNotification
>({
  name: "RejectedJobApplicationApplicantNotification",
  fields: () => ({
    ...GraphQLGenericApplicantNotificationFields,
    moderatorMessage: {
      type: nonNull(String)
    },
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
