import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { IOffer, OfferRepository } from "../../../models/Offer";
import { Int, List, nonNull, String } from "../../fieldTypes";

const createOffer = {
  type: GraphQLOffer,
  args: {
    companyUuid: {
      type: nonNull(String)
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
    sections: {
      type: List(GraphQLOfferSectionInput)
    },
    careers: {
      type: List(GraphQLOfferCareerInput)
    }
  },
  resolve: (_: undefined, props: IOffer) => OfferRepository.create(props)
};

export { createOffer };
