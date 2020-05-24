import { isApplicant, isCompanyUser, isUser } from "../rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompanyUser
  },
  Query: {
    getOfferByUuid: isUser,
    getOffers: isUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
