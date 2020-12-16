import { Company } from "$models";
import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { Secretary } from "$models/Admin";

export const UpdatedCompanyProfileNotificationFactory = {
  create: (company: Company) => {
    return [
      new UpdatedCompanyProfileAdminNotification({
        companyUuid: company.uuid,
        secretary: Secretary.extension
      }),
      new UpdatedCompanyProfileAdminNotification({
        companyUuid: company.uuid,
        secretary: Secretary.graduados
      })
    ];
  }
};
