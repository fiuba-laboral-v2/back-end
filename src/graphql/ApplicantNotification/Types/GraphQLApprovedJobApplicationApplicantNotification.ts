import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { Boolean, ID, nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";

import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";

import { JobApplicationRepository } from "$models/JobApplication";
import { UserRepository } from "$models/User";

export const GraphQLApprovedJobApplicationApplicantNotification = new GraphQLObjectType<
  ApprovedJobApplicationApplicantNotification
>({
  name: "ApprovedJobApplicationApplicantNotification",
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
