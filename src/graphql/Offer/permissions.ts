import { isApplicant } from "../rules";

export const offerPermissions = {
  Offer: {
    hasApplied: isApplicant
  }
};
