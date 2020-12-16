import { List, String } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { Secretary } from "$models/Admin";
import { IUpdateCompany } from "$models/Company/Interface";
import { CompanyRepository } from "$models/Company";
import {
  AdminNotificationRepository,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";

export const updateCurrentCompany = {
  type: GraphQLCompany,
  args: {
    companyName: {
      type: String
    },
    slogan: {
      type: String
    },
    description: {
      type: String
    },
    logo: {
      type: String
    },
    website: {
      type: String
    },
    email: {
      type: String
    },
    phoneNumbers: {
      type: List(String)
    },
    photos: {
      type: List(String)
    }
  },
  resolve: async (
    _: undefined,
    { phoneNumbers, photos, ...attributes }: IUpdateCompany,
    { currentUser }: IApolloServerContext
  ) => {
    const company = await CompanyRepository.findByUuid(currentUser.getCompanyRole().companyUuid);
    company.set(attributes);
    const notifications = [
      new UpdatedCompanyProfileAdminNotification({
        companyUuid: company.uuid,
        secretary: Secretary.extension
      }),
      new UpdatedCompanyProfileAdminNotification({
        companyUuid: company.uuid,
        secretary: Secretary.graduados
      })
    ];

    await Database.transaction(async transaction => {
      await CompanyRepository.save(company, transaction);
      for (const notification of notifications) {
        await AdminNotificationRepository.save(notification, transaction);
      }
    });
    return company;
  }
};
