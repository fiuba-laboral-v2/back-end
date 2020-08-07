import { isAdmin, isFromApprovedCompany } from "../Rules";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";
import { or } from "graphql-shield";

export const offerPermissions = {
  Mutation: {
    createOffer: isFromApprovedCompany,
    editOffer: isFromApprovedCompany
  },
  Query: {
    getMyOffers: isFromApprovedCompany,
    getOfferByUuid: or(isApprovedApplicant, isFromApprovedCompany, isAdmin),
    getOffers: isApprovedApplicant
  },
  Offer: {
    hasApplied: isApprovedApplicant
  }
};
