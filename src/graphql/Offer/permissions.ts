import { and } from "graphql-shield";
import { isAuthenticated, isAuthorized } from "../rules";

export const offerPermissions = {
  Query: {
    getOffers: isAuthenticated,
    getOfferByUuid: isAuthenticated
  },
  Mutation: {
    saveOffer: isAuthenticated
  },
  Offer: {
    hasApplied: and(isAuthenticated, isAuthorized)
  }
};
