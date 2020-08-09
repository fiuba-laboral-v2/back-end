import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { OfferRepository } from "$models/Offer";
import { ICompanyUser } from "$graphql/Context";
import { Int, List, nonNull, String } from "$graphql/fieldTypes";
import { ICreateOffer } from "$models/Offer/Interface";

export const createOffer = {
  type: GraphQLOffer,
  args: {
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
    sections: {
      type: List(GraphQLOfferSectionInput)
    },
    careers: {
      type: List(GraphQLOfferCareerInput)
    }
  },
  resolve: (
    _: undefined, attributes: ICreateOffer, { currentUser }: { currentUser: ICompanyUser }
  ) =>
    OfferRepository.create({ ...attributes, companyUuid: currentUser.company.uuid })
};
