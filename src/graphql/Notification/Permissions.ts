import { isAdmin, isApprovedApplicant, isFromApprovedCompany } from "$graphql/Rules";
import { or } from "graphql-shield";

export const notificationPermissions = {
  Query: {
    getNotifications: or(isAdmin, isApprovedApplicant, isFromApprovedCompany)
  }
};
