import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { GraphQLApplicantType } from "../../Applicant/Types/GraphQLApplicantType";
import { OfferRepository } from "$models/Offer";
import { Int, List, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { ICreateOffer } from "$models/Offer/Interface";
import { IApolloServerContext } from "$graphql/Context";
import { OfferWithNoCareersError } from "../Errors";

export const createOffer = {
  type: GraphQLOffer,
  args: {
    title: {
      type: nonNull(String)
    },
    description: {
      type: nonNull(String)
    },
    targetApplicantType: {
      type: nonNull(GraphQLApplicantType)
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
    sections: {
      type: List(GraphQLOfferSectionInput)
    },
    careers: {
      type: nonNull(List(nonNull(GraphQLOfferCareerInput)))
    }
  },
  resolve: (_: undefined, attributes: ICreateOffer, { currentUser }: IApolloServerContext) => {
    if (attributes.careers.length === 0) throw new OfferWithNoCareersError();

    return OfferRepository.create({
      ...attributes,
      companyUuid: currentUser.getCompanyRole().companyUuid
    });
  }
};
