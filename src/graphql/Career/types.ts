import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String } from "../fieldTypes";

const GCareer = new GraphQLObjectType({
  name: "career",
  fields: () => ({
    code: {
      type: nonNull(ID)
    },
    description: {
      type: nonNull(String)
    },
    credits: {
      type: Int
    }
  })
});

const CareerTypes = [ GCareer ];

export default CareerTypes;
