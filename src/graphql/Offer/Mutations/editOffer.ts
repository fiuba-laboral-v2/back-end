import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { GraphQLApplicantType } from "../../Applicant/Types/GraphQLApplicantType";
import { OfferRepository } from "$models/Offer";
import { CurrentUser } from "$models/CurrentUser";
import { ID, Int, List, nonNull, String } from "$graphql/fieldTypes";
import { IUpdateOffer } from "$models/Offer/Interface";

export const editOffer = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    },
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
  resolve: async (
    _: undefined,
    attributes: IUpdateOffer,
    { currentUser }: { currentUser: CurrentUser }
  ) =>
    OfferRepository.update({
      ...attributes,
      companyUuid: currentUser.getCompany().companyUuid
    })
};
