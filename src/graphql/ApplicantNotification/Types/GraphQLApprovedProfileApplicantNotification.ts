import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { Boolean, ID, nonNull, String } from "$graphql/fieldTypes";
import { ApprovedProfileApplicantNotification } from "$models/ApplicantNotification";
import { UserRepository } from "$models/User";

export const GraphQLApprovedProfileApplicantNotification = new GraphQLObjectType<
  ApprovedProfileApplicantNotification
>({
  name: "ApprovedProfileApplicantNotification",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    isNew: {
      type: nonNull(Boolean)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    },
    adminEmail: {
      type: nonNull(String),
      resolve: async notification => {
        const user = await UserRepository.findByUuid(notification.moderatorUuid);
        return user.email;
      }
    }
  })
});
