import { GraphQLCompanyNotification } from "./GraphQLCompanyNotification";
import { GraphQLNewJobApplicationCompanyNotification } from "./GraphQLNewJobApplicationCompanyNotification";
import { GraphQLApprovedOfferCompanyNotification } from "./GraphQLApprovedOfferCompanyNotification";
import { GraphQLRejectedOfferCompanyNotification } from "./GraphQLRejectedOfferCompanyNotification";
import { GraphQLApprovedProfileCompanyNotification } from "./GraphQLApprovedProfileCompanyNotification";
import { GraphQLRejectedProfileCompanyNotification } from "./GraphQLRejectedProfileCompanyNotification";

export const companyNotificationTypes = [
  GraphQLCompanyNotification,
  GraphQLNewJobApplicationCompanyNotification,
  GraphQLApprovedOfferCompanyNotification,
  GraphQLRejectedOfferCompanyNotification,
  GraphQLApprovedProfileCompanyNotification,
  GraphQLRejectedProfileCompanyNotification
];
