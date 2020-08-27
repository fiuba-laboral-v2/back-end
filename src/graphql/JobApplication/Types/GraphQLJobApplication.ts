import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull, String, ID } from "$graphql/fieldTypes";
import { JobApplication } from "$models";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";

export const GraphQLJobApplication = new GraphQLObjectType<JobApplication>({
  name: "JobApplication",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    applicantUuid: {
      type: nonNull(String)
    },
    offerUuid: {
      type: nonNull(String)
    },
    extensionApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    graduadosApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    applicant: {
      type: nonNull(GraphQLApplicant),
      resolve: jobApplication => jobApplication.getApplicant()
    },
    offer: {
      type: nonNull(GraphQLOffer),
      resolve: jobApplication => jobApplication.getOffer()
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});
