import { NotificationRepository } from "$models/Notification";
import { Company, JobApplication, Notification, User } from "$models";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";
import { range } from "lodash";
import MockDate from "mockdate";

export const NotificationGenerator = {
  instance: {
    JobApplication: {
      from: async ({ uuid: jobApplicationUuid }: JobApplication, { uuid: receiverUuid }: User) => {
        const { userUuid: senderUuid } = await AdminGenerator.extension();
        const notification = new Notification({ receiverUuid, senderUuid, jobApplicationUuid });
        return NotificationRepository.save(notification);
      },
      approved: async (company: Company) => {
        const jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
        const [user] = await company.getUsers();
        return NotificationGenerator.instance.JobApplication.from(jobApplication, user);
      },
      list: async ({ company, size }: { company: Company; size: number }) => {
        const notifications: Notification[] = [];
        for (const milliseconds of range(size)) {
          MockDate.set(milliseconds);
          notifications.push(await NotificationGenerator.instance.JobApplication.approved(company));
          MockDate.reset();
        }
        return notifications.sort(({ createdAt }) => -createdAt);
      }
    }
  }
};
