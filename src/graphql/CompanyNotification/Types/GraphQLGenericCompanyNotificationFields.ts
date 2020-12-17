import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { GraphQLSecretary } from "$graphql/Admin/Types/GraphQLSecretary";

import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

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
  moderatorSecretary: {
    type: nonNull(GraphQLSecretary),
    resolve: async notification => {
      const admin = await AdminRepository.findByUserUuid(notification.moderatorUuid);
      return admin.secretary;
    }
  },
  adminEmail: {
    type: nonNull(String),
    resolve: async notification => {
      const admin = await AdminRepository.findByUserUuid(notification.moderatorUuid);
      const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
      return settings.email;
    }
  }
};
