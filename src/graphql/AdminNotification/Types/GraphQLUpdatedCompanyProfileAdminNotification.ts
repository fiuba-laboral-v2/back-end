import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { Boolean, ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";

import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";

import { CompanyRepository } from "$models/Company";

export const GraphQLUpdatedCompanyProfileAdminNotification = new GraphQLObjectType<
  UpdatedCompanyProfileAdminNotification
>({
  name: "UpdatedCompanyProfileAdminNotification",
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
    company: {
      type: nonNull(GraphQLCompany),
      resolve: notification => CompanyRepository.findByUuid(notification.companyUuid)
    }
  })
});
