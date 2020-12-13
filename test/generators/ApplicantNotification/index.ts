import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification,
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification,
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
    rejectedJobApplication: async ({ applicant, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid } = applicant || (await ApplicantGenerator.instance.withMinimumData());
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const attributes = {
        moderatorUuid,
        notifiedApplicantUuid: uuid,
        jobApplicationUuid: jobApplication.uuid,
        moderatorMessage: "message",
        isNew: true
      };
      const notification = new RejectedJobApplicationApplicantNotification(attributes);
      await ApplicantNotificationRepository.save(notification);
      return notification;
    },
    approvedProfile: async ({ applicant, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid } = applicant || (await ApplicantGenerator.instance.withMinimumData());
      const attributes = { moderatorUuid, notifiedApplicantUuid: uuid, isNew: true };
      const notification = new ApprovedProfileApplicantNotification(attributes);
      await ApplicantNotificationRepository.save(notification);
      return notification;
    },
    rejectedProfile: async ({ applicant, admin }: IGeneratorAttributes) => {
      const { userUuid: moderatorUuid } = admin || (await AdminGenerator.extension());
      const { uuid } = applicant || (await ApplicantGenerator.instance.withMinimumData());
      const attributes = {
        moderatorUuid,
        notifiedApplicantUuid: uuid,
        moderatorMessage: "message"
      };
      const notification = new RejectedProfileApplicantNotification(attributes);
      await ApplicantNotificationRepository.save(notification);
      return notification;
    },
    range: async ({ applicant, size }: { size: number; applicant: Applicant }) => {
      const admin = await AdminGenerator.extension();
      const values: ApplicantNotification[] = [];
      const generators = [
        ApplicantNotificationGenerator.instance.approvedJobApplication,
        ApplicantNotificationGenerator.instance.rejectedJobApplication,
        ApplicantNotificationGenerator.instance.approvedProfile,
        ApplicantNotificationGenerator.instance.rejectedProfile
      ];
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
