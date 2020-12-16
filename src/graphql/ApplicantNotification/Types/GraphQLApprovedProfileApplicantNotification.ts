import { GraphQLObjectType } from "graphql";
import { GraphQLGenericApplicantNotificationFields } from "./GraphQLGenericApplicantNotificationFields";
import { ApprovedProfileApplicantNotification } from "$models/ApplicantNotification";

export const GraphQLApprovedProfileApplicantNotification = new GraphQLObjectType<
  ApprovedProfileApplicantNotification
>({
  name: "ApprovedProfileApplicantNotification",
  fields: () => GraphQLGenericApplicantNotificationFields
});
