import { and } from "graphql-shield";
import { isAuthenticated, isApplicant } from "../rules";

export const offerPermissions = {
  Query: {
    getOffers: isAuthenticated,
    getOfferByUuid: isAuthenticated
  },
  Mutation: {
    saveOffer: isAuthenticated
  },
  Offer: {
    hasApplied: and(isAuthenticated, isApplicant)
  }
};
