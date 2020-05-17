import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "../../fieldTypes";

const GraphQLJobApplication = new GraphQLObjectType({
  name: "JobApplication",
  fields: () => ({
    applicantUuid: {
      type: nonNull(String)
    },
    offerUuid: {
      type: nonNull(String)
    }
  })
});

export { GraphQLJobApplication };
