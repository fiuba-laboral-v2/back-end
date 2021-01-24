import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLOfferCareerInput } from "../Types/GraphQLOfferCareer";
import { GraphQLOfferSectionInput } from "../Types/GraphQLOfferSection";
import { GraphQLApplicantType } from "../../Applicant/Types/GraphQLApplicantType";
import { OfferRepository } from "$models/Offer";
import { Boolean, ID, Int, List, nonNull, String } from "$graphql/fieldTypes";
import { IUpdateOffer } from "$models/Offer/Interface";
import { IApolloServerContext } from "$graphql/Context";
import { OfferNotVisibleByCurrentUserError } from "$graphql/Offer/Queries/Errors";
import { OfferWithNoCareersError } from "$graphql/Offer/Errors";

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
      type: nonNull(List(GraphQLOfferSectionInput))
    },
    careers: {
      type: nonNull(List(nonNull(GraphQLOfferCareerInput)))
    }
  },
  resolve: async (
    _: undefined,
    { careers, sections, uuid, ...offerAttributes }: IUpdateOffer,
    { currentUser }: IApolloServerContext
  ) => {
    const permissions = currentUser.getCompanyRole().getPermissions();
    if (careers.length === 0) throw new OfferWithNoCareersError();
    if (offerAttributes.isInternship) await permissions.canPublishInternship();

    const offer = await OfferRepository.findByUuid(uuid);
    const canEdit = await permissions.canSeeOffer(offer);
    if (!canEdit) throw new OfferNotVisibleByCurrentUserError();

    offer.set({ maximumSalary: undefined, ...offerAttributes });
    offer.moveToPending();
    return OfferRepository.update({ sections, careers, offer });
  }
};
