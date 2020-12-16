import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull, String, Boolean } from "$graphql/fieldTypes";
import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

export const GraphQLGenericApplicantNotificationFields = {
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
      const admin = await AdminRepository.findByUserUuid(notification.moderatorUuid);
      const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
      return settings.email;
    }
  }
};
