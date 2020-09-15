import { isAdmin, isFromApprovedCompany, isApprovedApplicant } from "$graphql/Rules";
import { or } from "graphql-shield";

export const offerPermissions = {
  Mutation: {
    createOffer: isFromApprovedCompany,
    updateOfferApprovalStatus: isAdmin,
    editOffer: isFromApprovedCompany
  },
  Query: {
    getMyOffers: isFromApprovedCompany,
    getOfferByUuid: or(isFromApprovedCompany, isAdmin),
    getOffers: isAdmin,
    getApprovedOffers: isApprovedApplicant,
    getOfferVisibleByCurrentApplicant: isApprovedApplicant
  },
  Offer: {
    hasApplied: isApprovedApplicant
  }
};
