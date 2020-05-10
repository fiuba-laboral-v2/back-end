import { GraphQLObjectType } from "graphql";
import { IApolloServerContext } from "../../../server";
import { ID, Int, List, nonNull, String, Boolean } from "../../fieldTypes";
import { GraphQLOfferSection } from "./GraphQLOfferSection";
import { GraphQLCareer } from "../../Career/Types/Career";
import { GraphQLCompany } from "../../Company/Types/GraphQLCompany";
import { Offer } from "../../../models/Offer";
import { UserRepository } from "../../../models/User";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { UnauthorizedError } from "../../Errors";

const GraphQLOffer = new GraphQLObjectType({
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
    createdAt: {
      type: nonNull(String)
    },
    sections: {
      type: List(GraphQLOfferSection),
      resolve: (offer: Offer) => offer.getSections()
    },
    careers: {
      type: List(GraphQLCareer),
      resolve: (offer: Offer) => offer.getCareers()
    },
    company: {
      type: GraphQLCompany,
      resolve: (offer: Offer) => offer.getCompany()
    },
    hasApplied: {
      type: nonNull(Boolean),
      resolve: async (offer: Offer, _, { currentUser }: IApolloServerContext) => {
        const user = await UserRepository.findByEmail(currentUser!.email);
        const applicant = await user.getApplicant();

        return JobApplicationRepository.hasApplied(applicant, offer);
      }
    }
  })
});

export { GraphQLOffer };
