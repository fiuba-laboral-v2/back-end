import { isApplicant, isCompany } from "../rules";

export const offerPermissions = {
  Mutation: {
    createOffer: isCompany
  },
  Offer: {
    hasApplied: isApplicant
  }
};
