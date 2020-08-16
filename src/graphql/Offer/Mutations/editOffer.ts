import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { OfferRepository } from "$models/Offer";
import { ICompanyUser } from "$graphql/Context";
import { ID, Int, List, nonNull, String } from "$graphql/fieldTypes";
import { IUpdateOffer } from "$models/Offer/Interface";

export const editOffer = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID),
    },
    title: {
      type: nonNull(String),
    },
    description: {
      type: nonNull(String),
    },
    hoursPerDay: {
      type: nonNull(Int),
    },
    minimumSalary: {
      type: nonNull(Int),
    },
    maximumSalary: {
      type: nonNull(Int),
    },
    sections: {
      type: List(GraphQLOfferSectionInput),
    },
    careers: {
      type: List(GraphQLOfferCareerInput),
    },
  },
  resolve: async (
    _: undefined,
    attributes: IUpdateOffer,
    { currentUser }: { currentUser: ICompanyUser }
  ) =>
    OfferRepository.update({
      companyUuid: currentUser.company.uuid,
      ...attributes,
    }),
};
