import { GraphQLObjectType } from "graphql";
import { ID, Int, nonNull, String, List } from "../../fieldTypes";
import { Company } from "../../../models/Company";

const GraphQLCompany = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: {
      type: ID,
      resolve: ({ id }: Company) => id
    },
    cuit: {
      type: nonNull(String),
      resolve: ({ cuit }: Company) => cuit
    },
    companyName: {
      type: nonNull(String),
      resolve: ({ companyName }: Company) => companyName
    },
    slogan: {
      type: String,
      resolve: ({ slogan }: Company) => slogan
    },
    description: {
      type: String,
      resolve: ({ description }: Company) => description
    },
    logo: {
      type: String,
      resolve: ({ logo }: Company) => logo
    },
    website: {
      type: String,
      resolve: ({ website }: Company) => website
    },
    email: {
      type: String,
      resolve: ({ email }: Company) => email
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
