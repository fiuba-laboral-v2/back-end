import { isApplicant, isCompanyUser, isUser, isCompanyApproved } from "../Rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompanyUser,
    editOffer: isCompanyUser
  },
  Query: {
    getMyOffers: isCompanyApproved,
    getOfferByUuid: isUser,
    getOffers: isUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
