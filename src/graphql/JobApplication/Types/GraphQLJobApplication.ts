import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";
import { GraphQLOffer } from "../../Offer/Types/GraphQLOffer";

const GraphQLJobApplication = new GraphQLObjectType({
  name: "JobApplication",
  fields: () => ({
    applicantUuid: {
      type: nonNull(String)
    },
    offer: {
      type: nonNull(GraphQLOffer)
    }
  })
});

export { GraphQLJobApplication };
