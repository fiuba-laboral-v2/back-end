import { isApplicant, isCompanyUser } from "../rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompanyUser
  },
  Offer: {
    hasApplied: isApplicant
  }
};
