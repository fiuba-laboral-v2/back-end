import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, List, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { Company } from "$models";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLUser } from "$graphql/User/Types/GraphQLUser";
import { UserRepository } from "$models/User";

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
    businessName: {
      type: nonNull(String)
    },
    businessSector: {
      type: nonNull(String)
    },
    hasAnInternshipAgreement: {
      type: nonNull(Boolean)
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
    updatedAt: {
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
      resolve: async company => (await company.getPhotos()).map(({ photo }) => photo)
    },
    users: {
      type: List(GraphQLUser),
      resolve: company => UserRepository.findByCompanyUuid(company.uuid)
    }
  })
});
