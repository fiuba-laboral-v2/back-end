import { NotificationRepository } from "$models/Notification";
import { Company, Notification } from "$models";

import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";

export const NotificationGenerator = {
  instance: {
    JobApplication: {
      approved: async (company: Company) => {
        const jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
        const [user] = await company.getUsers();
        const extensionAdmin = await AdminGenerator.extension();
        const notification = new Notification({
          userUuid: user.uuid,
          adminUserUuid: extensionAdmin.userUuid,
          jobApplicationUuid: jobApplication.uuid
        });
        return NotificationRepository.save(notification);
      }
    }
  }
};
