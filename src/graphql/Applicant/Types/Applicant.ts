import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";
import { GraphQLCapability } from "./Capability";
import { GraphQLCareer } from "../../Career/Types/Career";

const GraphQLApplicant = new GraphQLObjectType({
  name: "Applicant",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: nonNull(String)
    },
    surname: {
      type: nonNull(String)
    },
    padron: {
      type: nonNull(Int)
    },
    credits: {
      type: nonNull(Int)
    },
    description: {
      type: String
    },
    careers: {
      type: nonNull(List(GraphQLCareer))
    },
    capabilities: {
      type: nonNull(List(GraphQLCapability))
    }
  })
});

export { GraphQLApplicant };
