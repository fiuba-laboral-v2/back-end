import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { IApolloServerContext } from "$graphql/Context";
import { ID, Int, List, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { GraphQLOfferSection } from "./GraphQLOfferSection";
import { GraphQLCareer } from "$graphql/Career/Types/GraphQLCareer";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { Offer } from "$models";
import { UserRepository } from "$models/User";
import { JobApplicationRepository } from "$models/JobApplication";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { GraphQLApplicantType } from "../../Applicant/Types/GraphQLApplicantType";

export const GraphQLOffer = new GraphQLObjectType<Offer, IApolloServerContext>({
  name: "Offer",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    title: {
      type: nonNull(String)
    },
    description: {
      type: nonNull(String)
    },
    hoursPerDay: {
      type: nonNull(Int)
    },
    minimumSalary: {
      type: nonNull(Int)
    },
    maximumSalary: {
      type: nonNull(Int)
    },
    extensionApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    graduadosApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    expirationDateForExtension: {
      type: GraphQLDateTime
    },
    expirationDateForGraduados: {
      type: GraphQLDateTime
    },
    targetApplicantType: {
      type: nonNull(GraphQLApplicantType)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    sections: {
      type: List(GraphQLOfferSection),
      resolve: offer => offer.getSections()
    },
    careers: {
      type: List(GraphQLCareer),
      resolve: offer => offer.getCareers()
    },
    company: {
      type: GraphQLCompany,
      resolve: offer => offer.getCompany()
    },
    hasApplied: {
      type: nonNull(Boolean),
      resolve: async (offer, _, { currentUser }) => {
        const user = await UserRepository.findByEmail(currentUser.email);
        const applicant = await user.getApplicant();

        return JobApplicationRepository.hasApplied(applicant, offer);
      }
    }
  })
});
