import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { Boolean, ID, nonNull, String } from "$graphql/fieldTypes";
import { RejectedProfileApplicantNotification } from "$models/ApplicantNotification";
import { UserRepository } from "$models/User";

export const GraphQLRejectedProfileApplicantNotification = new GraphQLObjectType<
  RejectedProfileApplicantNotification
>({
  name: "RejectedProfileApplicantNotification",
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
    moderatorMessage: {
      type: nonNull(String)
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
