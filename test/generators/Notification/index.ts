import { NotificationRepository } from "$models/Notification";
import { Company, JobApplication, Notification, User } from "$models";

import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";

export const NotificationGenerator = {
  instance: {
    JobApplication: {
      from: async ({ uuid: jobApplicationUuid }: JobApplication, { uuid: userUuid }: User) => {
        const { userUuid: adminUserUuid } = await AdminGenerator.extension();
        const notification = new Notification({ userUuid, adminUserUuid, jobApplicationUuid });
        return NotificationRepository.save(notification);
      },
      approved: async (company: Company) => {
        const jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
        const [user] = await company.getUsers();
        return NotificationGenerator.instance.JobApplication.from(jobApplication, user);
      }
    }
  }
};
