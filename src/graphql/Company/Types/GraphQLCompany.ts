import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, List, nonNull, String } from "../../fieldTypes";
import { Company } from "../../../models";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLUser } from "../../User/Types/GraphQLUser";

export const GraphQLCompany = new GraphQLObjectType<Company>({
  name: "Company",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
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
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    phoneNumbers: {
      type: List(String),
      resolve: async company =>
        (await company.getPhoneNumbers()).map(({ phoneNumber }) => phoneNumber)
    },
    photos: {
      type: List(String),
      resolve: async company =>
        (await company.getPhotos()).map(({ photo }) => photo)
    },
    users: {
      type: List(GraphQLUser),
      resolve: company => company.getUsers()
    }
  })
});
