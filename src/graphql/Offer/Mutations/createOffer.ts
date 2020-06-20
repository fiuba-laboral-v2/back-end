import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { IOffer, OfferRepository } from "../../../models/Offer";
import { ICompanyUser } from "../../Context";
import { Int, List, nonNull, String } from "../../fieldTypes";

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
  resolve: (_: undefined, props: IOffer, { currentUser }: { currentUser: ICompanyUser }) =>
    OfferRepository.create({ companyUuid: currentUser.company.uuid, ...props })
};
