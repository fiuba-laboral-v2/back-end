import {
  ApprovedJobApplicationApplicantNotification,
  ApplicantNotification,
  ApplicantNotificationRepository
} from "$models/ApplicantNotification";
import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { Admin, Applicant } from "$models";
import { range, sample } from "lodash";
import MockDate from "mockdate";

export const ApplicantNotificationGenerator = {
  instance: {
    approvedJobApplication: async ({ applicant, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid } = applicant || (await ApplicantGenerator.instance.withMinimumData());
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const attributes = {
        moderatorUuid,
        notifiedApplicantUuid: uuid,
        jobApplicationUuid: jobApplication.uuid,
        isNew: true
      };
      const notification = new ApprovedJobApplicationApplicantNotification(attributes);
      await ApplicantNotificationRepository.save(notification);
      return notification;
    },
    range: async ({ applicant, size }: { size: number; applicant: Applicant }) => {
      const admin = await AdminGenerator.extension();
      const values: ApplicantNotification[] = [];
      const generators = [ApplicantNotificationGenerator.instance.approvedJobApplication];
      for (const milliseconds of range(size)) {
        MockDate.set(milliseconds);
        const generator = sample<Generator>(generators);
        values.push(await generator!({ applicant, admin }));
        MockDate.reset();
      }
      return values.sort(value => -value.createdAt!);
    }
  }
};

type Generator = (attributes: IGeneratorAttributes) => Promise<ApplicantNotification>;

interface IGeneratorAttributes {
  applicant?: Applicant;
  admin?: Admin;
}
