import { isApplicant, isCompanyUser, isUser, isFromApprovedCompany } from "../Rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isFromApprovedCompany,
    editOffer: isCompanyUser
  },
  Query: {
    getMyOffers: isFromApprovedCompany,
    getOfferByUuid: isUser,
    getOffers: isUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
