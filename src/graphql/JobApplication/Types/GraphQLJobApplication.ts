import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";
import { JobApplication } from "../../../models/JobApplication/Model";
import { GraphQLApplicant } from "../../Applicant/Types/Applicant";
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
    }
  })
});

export { GraphQLJobApplication };
