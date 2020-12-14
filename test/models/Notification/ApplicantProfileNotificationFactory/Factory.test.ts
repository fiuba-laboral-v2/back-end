import { Applicant, Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import {
  ApplicantProfileNotificationFactory,
  MissingModeratorMessageError
} from "$models/Notification";
import {
  ApprovedProfileApplicantNotification,
  RejectedProfileApplicantNotification
} from "$models/ApplicantNotification";
import { UUID } from "$models/UUID";

describe("ApplicantProfileNotificationFactory", () => {
  const factory = ApplicantProfileNotificationFactory;
  let applicant: Applicant;
  let admin: Admin;

  beforeAll(() => {
    applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
    admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
  });

  describe("Approved applicant", () => {
    beforeAll(() => applicant.set({ approvalStatus: ApprovalStatus.approved }));

    it("returns an array with a ApprovedProfileApplicantNotification", async () => {
      const notifications = factory.create(applicant, admin);
      const [notification] = notifications;

      expect(notifications).toHaveLength(1);
      expect(notification).toBeInstanceOf(ApprovedProfileApplicantNotification);
    });

    it("returns an array with a the correct attributes", async () => {
      const notifications = factory.create(applicant, admin);

      expect(notifications).toEqual([
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid,
          isNew: true,
          createdAt: undefined
        }
      ]);
    });
  });

  describe("Rejected applicant", () => {
    const moderatorMessage = "message";

    beforeAll(() => applicant.set({ approvalStatus: ApprovalStatus.rejected }));

    it("returns an array with RejectedProfileApplicantNotification", async () => {
      const notifications = factory.create(applicant, admin, moderatorMessage);
      const [notification] = notifications;

      expect(notifications).toHaveLength(1);
      expect(notification).toBeInstanceOf(RejectedProfileApplicantNotification);
    });

    it("returns an array with a the correct attributes", async () => {
      const notifications = factory.create(applicant, admin, moderatorMessage);

      expect(notifications).toEqual([
        {
          uuid: undefined,
          moderatorUuid: admin.userUuid,
          notifiedApplicantUuid: applicant.uuid,
          moderatorMessage,
          isNew: true,
          createdAt: undefined
        }
      ]);
    });

    it("throws an error if no moderatorMessage is provided", async () => {
      expect(() => factory.create(applicant, admin)).toThrowErrorWithMessage(
        MissingModeratorMessageError,
        MissingModeratorMessageError.buildMessage()
      );
    });
  });

  describe("Pending applicant", () => {
    beforeAll(() => applicant.set({ approvalStatus: ApprovalStatus.pending }));

    it("returns an empty array", async () => {
      const notifications = factory.create(applicant, admin);
      expect(notifications).toEqual([]);
    });
  });
});
