import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { Admin, Company } from "$models";

export const CompanyNotificationGenerator = {
  instance: {
    newJobApplication: async ({ company, admin }: { company?: Company; admin?: Admin }) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid: companyUuid } = company || (await CompanyGenerator.instance.withMinimumData());
      const jobApplication = await JobApplicationGenerator.instance.toTheCompany(companyUuid);
      const attributes = {
        moderatorUuid,
        notifiedCompanyUuid: companyUuid,
        jobApplicationUuid: jobApplication.uuid,
        isNew: true
      };
      const notification = new CompanyNewJobApplicationNotification(attributes);
      await CompanyNotificationRepository.save(notification);
      return notification;
    }
  }
};
