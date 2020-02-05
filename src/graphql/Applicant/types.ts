import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../fieldTypes";

const applicantProfileType = new GraphQLObjectType({
  name: "ApplicantProfile",
  fields: () => ({
    id: {
      type: ID
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
    degree: {
      type: nonNull(List(String))
    },
    capabilities: {
      type: List(String)
    }
  })
});

const ApplicantTypes = [ applicantProfileType ];
export { ApplicantTypes };
