import { GraphQLObjectType } from "graphql";
import { nonNull } from "../../fieldTypes";
import { GraphQLApplicant } from "../../Applicant/Types/Applicant";
import { GraphQLOffer } from "../../Offer/Types/GraphQLOffer";

const GraphQLJobApplication = new GraphQLObjectType({
  name: "JobApplication",
  fields: () => ({
    applicant: {
      type: nonNull(GraphQLApplicant)
    },
    offer: {
      type: nonNull(GraphQLOffer)
    }
  })
});

export { GraphQLJobApplication };
