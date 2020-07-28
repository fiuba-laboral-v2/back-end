import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull, String } from "../../fieldTypes";
import { JobApplication } from "../../../models";
import { GraphQLApplicant } from "../../Applicant/Types/GraphQLApplicant";
import { GraphQLOffer } from "../../Offer/Types/GraphQLOffer";

const GraphQLJobApplication = new GraphQLObjectType<JobApplication>({
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
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});

export { GraphQLJobApplication };
