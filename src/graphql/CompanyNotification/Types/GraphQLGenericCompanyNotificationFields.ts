import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { UserRepository } from "$models/User";

export const GraphQLGenericCompanyNotificationFields = {
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
};
