import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";

const GraphQLCompany = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: {
      type: ID
    },
    cuit: {
      type: nonNull(String)
    },
    companyName: {
      type: nonNull(String)
    },
    slogan: {
      type: String
    },
    description: {
      type: String
    },
    logo: {
      type: String
    },
    website: {
      type: String
    },
    email: {
      type: String
    },
    phoneNumbers: {
      type: List(Int)
    },
    photos: {
      type: List(String)
    }
  })
});

export { GraphQLCompany };
