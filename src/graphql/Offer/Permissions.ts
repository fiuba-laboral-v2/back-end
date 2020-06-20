import { isApplicant, isCompanyUser, isUser } from "../Rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompanyUser,
    editOffer: isCompanyUser
  },
  Query: {
    getMyOffers: isCompanyUser,
    getOfferByUuid: isUser,
    getOffers: isUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
