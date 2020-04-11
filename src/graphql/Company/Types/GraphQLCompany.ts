import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";
import { Company } from "../../../models/Company";

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
      type: List(Int),
      resolve: async (company: Company) =>
        (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber)
    },
    photos: {
      type: List(String),
      resolve: async (company: Company) =>
        (await company.getPhotos()).map(({ photo }) => photo)
    }
  })
});

export { GraphQLCompany };
