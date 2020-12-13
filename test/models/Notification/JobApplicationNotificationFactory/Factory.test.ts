import {
  JobApplicationNotificationFactory,
  MissingModeratorMessageError
} from "$models/Notification";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import {
  ApprovedJobApplicationApplicantNotification,
  RejectedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { OfferRepository } from "$models/Offer";
import { Admin, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";

import { CuitGenerator } from "$generators/Cuit";
import { OfferGenerator } from "$generators/Offer";

describe("JobApplicationNotificationFactory", () => {
  let admin: Admin;
  let company: Company;
  let jobApplication: JobApplication;
  let offer: Offer;
  const factory = JobApplicationNotificationFactory;

  beforeAll(async () => {
    admin = new Admin({
      userUuid: UUID.generate(),
      secretary: Secretary.extension
    });

    company = new Company({
      uuid: UUID.generate(),
      cuit: CuitGenerator.generate(),
      companyName: "companyName",
      businessName: "businessName"
    });

    jobApplication = new JobApplication({
      offerUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });

    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid }));
  });

  beforeEach(() => jest.spyOn(OfferRepository, "findByUuid").mockImplementation(async () => offer));

  describe("Approved JobApplication", () => {
    it("returns an array with a NewJobApplicationCompanyNotification and ApprovedJobApplicationApplicantNotification", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.approved });
      const notifications = await factory.create(jobApplication, admin);
      expect(notifications).toHaveLength(2);
      const [firstNotification, secondNotification] = notifications;
      expect(firstNotification).toBeInstanceOf(NewJobApplicationCompanyNotification);
      expect(secondNotification).toBeInstanceOf(ApprovedJobApplicationApplicantNotification);
    });

    it("returns an array with a the correct attributes", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.approved });
      const notifications = await factory.create(jobApplication, admin);

      expect(notifications).toEqual([
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedCompanyUuid: company.uuid,
          jobApplicationUuid: jobApplication.uuid,
          isNew: true,
          createdAt: undefined
        },
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: jobApplication.applicantUuid,
          jobApplicationUuid: jobApplication.uuid,
          isNew: true,
          createdAt: undefined
        }
      ]);
    });
  });

  describe("Rejected JobApplication", () => {
    it("returns an array with a RejectedJobApplicationApplicantNotification", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
      const moderatorMessage = "message";
      const notifications = await factory.create(jobApplication, admin, moderatorMessage);
      expect(notifications).toHaveLength(1);
      const [notification] = notifications;
      expect(notification).toBeInstanceOf(RejectedJobApplicationApplicantNotification);
    });

    it("returns an array with the correct attributes", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
      const moderatorMessage = "message";
      const notifications = await factory.create(jobApplication, admin, moderatorMessage);
      expect(notifications).toEqual([
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: jobApplication.applicantUuid,
          jobApplicationUuid: jobApplication.uuid,
          isNew: true,
          moderatorMessage,
          createdAt: undefined
        }
      ]);
    });

    it("throws an error if no moderatorMessage is provided", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
      await expect(factory.create(jobApplication, admin)).rejects.toThrowErrorWithMessage(
        MissingModeratorMessageError,
        MissingModeratorMessageError.buildMessage()
      );
    });
  });

  describe("Pending JobApplication", () => {
    it("returns an empty array if the jobApplication is pending", async () => {
      jobApplication.set({ approvalStatus: ApprovalStatus.pending });
      const notifications = await factory.create(jobApplication, admin);
      expect(notifications).toEqual([]);
    });
  });
});
