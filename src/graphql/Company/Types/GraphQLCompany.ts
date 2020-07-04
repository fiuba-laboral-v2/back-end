import { GraphQLObjectType } from "graphql";
import { ID, List, nonNull, String } from "../../fieldTypes";
import { Company } from "../../../models/Company";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";

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
      type: nonNull(String)
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
    }
  })
});
