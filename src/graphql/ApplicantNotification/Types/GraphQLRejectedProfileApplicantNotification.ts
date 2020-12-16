import { GraphQLObjectType } from "graphql";
import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLGenericApplicantNotificationFields } from "./GraphQLGenericApplicantNotificationFields";
import { RejectedProfileApplicantNotification } from "$models/ApplicantNotification";

export const GraphQLRejectedProfileApplicantNotification = new GraphQLObjectType<
  RejectedProfileApplicantNotification
>({
  name: "RejectedProfileApplicantNotification",
  fields: () => ({
    ...GraphQLGenericApplicantNotificationFields,
    moderatorMessage: {
      type: nonNull(String)
    }
  })
});
