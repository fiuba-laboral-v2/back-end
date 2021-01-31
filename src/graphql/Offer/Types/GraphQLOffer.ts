import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { IApolloServerContext } from "$graphql/Context";
import { ID, Int, List, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { GraphQLOfferSection } from "./GraphQLOfferSection";
import { GraphQLCareer } from "$graphql/Career/Types/GraphQLCareer";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { Offer } from "$models";
import { UserRepository } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { JobApplicationNotFoundError, JobApplicationRepository } from "$models/JobApplication";
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
    isInternship: {
      type: nonNull(Boolean)
    },
    minimumSalary: {
      type: nonNull(Int)
    },
    maximumSalary: {
      type: Int
    },
    extensionApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    graduadosApprovalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    },
    studentsExpirationDateTime: {
      type: GraphQLDateTime
    },
    graduatesExpirationDateTime: {
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
        const user = await UserRepository.findByUuid(currentUser.uuid);
        const applicant = await ApplicantRepository.findByUserUuid(user.uuid!);
        try {
          const jobApplication = await JobApplicationRepository.findByApplicantAndOffer(
            applicant,
            offer
          );
          return !jobApplication.isRejected();
        } catch (error) {
          if (error instanceof JobApplicationNotFoundError) return false;
          throw error;
        }
      }
    }
  })
});
