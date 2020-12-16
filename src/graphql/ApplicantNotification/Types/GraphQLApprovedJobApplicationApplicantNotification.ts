import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLGenericApplicantNotificationFields } from "./GraphQLGenericApplicantNotificationFields";

import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";

import { JobApplicationRepository } from "$models/JobApplication";

export const GraphQLApprovedJobApplicationApplicantNotification = new GraphQLObjectType<
  ApprovedJobApplicationApplicantNotification
>({
  name: "ApprovedJobApplicationApplicantNotification",
  fields: () => ({
    ...GraphQLGenericApplicantNotificationFields,
    jobApplication: {
      type: nonNull(GraphQLJobApplication),
      resolve: notification => JobApplicationRepository.findByUuid(notification.jobApplicationUuid)
    }
  })
});
