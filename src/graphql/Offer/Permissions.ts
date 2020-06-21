import { isApplicant, isCompanyUser, isUser, isApprovedCompany } from "../Rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isApprovedCompany,
    editOffer: isCompanyUser
  },
  Query: {
    getMyOffers: isApprovedCompany,
    getOfferByUuid: isUser,
    getOffers: isUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
