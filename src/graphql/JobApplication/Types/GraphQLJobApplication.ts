import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";
import { GraphQLApplicant } from "../../Applicant/Types/Applicant";
import { GraphQLOffer } from "../../Offer/Types/GraphQLOffer";

const GraphQLJobApplication = new GraphQLObjectType({
  name: "JobApplication",
  fields: () => ({
    applicantUuid: {
      type: nonNull(String)
    },
    offerUuid: {
      type: nonNull(String)
    },
    applicant: {
      type: nonNull(GraphQLApplicant)
    },
    offer: {
      type: nonNull(GraphQLOffer)
    }
  })
});

export { GraphQLJobApplication };
