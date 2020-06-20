import { isApplicant, isCompanyUser, isUser, isCompanyApproved } from "../Rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompanyApproved,
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
