import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull, String } from "$graphql/fieldTypes";
import { JobApplication } from "$models";
import { GraphQLApplicant } from "$graphql/Applicant/Types/GraphQLApplicant";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";

export const GraphQLJobApplication = new GraphQLObjectType<JobApplication>({
  name: "JobApplication",
  fields: () => ({
    applicantUuid: {
      type: nonNull(String)
    },
    offerUuid: {
      type: nonNull(String)
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
    }
  })
});
