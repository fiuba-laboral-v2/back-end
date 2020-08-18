import { JobApplicationApprovalEventRepository } from "$models/JobApplication/JobApplicationsApprovalEvent";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Admin } from "$models";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { Secretary } from "$models/Admin";
import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { ApplicantGenerator } from "$generators/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ValidationError } from "sequelize";

describe("JobApplicationApprovalEventRepository", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    admin = await AdminGenerator.instance({ secretary: Secretary.extension });
  });

  const createOfferAndApplicant = async () => {
    const { uuid: applicantUuid } = await ApplicantGenerator.instance.withMinimumData();
    const { uuid: companyUuid } = await CompanyGenerator.instance.withCompleteData();
    const { uuid: offerUuid } = await OfferGenerator.instance.withOneSection({ companyUuid });
    return { applicantUuid, offerUuid };
  };

  const expectToCreateEventWithStatus = async (
    status: ApprovalStatus,
    applicantUuid: string,
    offerUuid: string
  ) => {
    const attributes = {
      offerUuid,
      applicantUuid,
      adminUserUuid: admin.userUuid,
      status
    };
    const event = await JobApplicationApprovalEventRepository.create(attributes);
    expect(event).toEqual(
      expect.objectContaining({
        ...attributes,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    );
  };

  describe("create", () => {
    it("creates an event with a pending status", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      await expectToCreateEventWithStatus(ApprovalStatus.pending, applicantUuid, offerUuid);
    });

    it("creates an event with an approved status", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      await expectToCreateEventWithStatus(ApprovalStatus.approved, applicantUuid, offerUuid);
    });

    it("creates an event with a rejected status", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      await expectToCreateEventWithStatus(ApprovalStatus.rejected, applicantUuid, offerUuid);
    });

    it("logs events for the same applicantUuid and offerUuid", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      await expectToCreateEventWithStatus(ApprovalStatus.pending, applicantUuid, offerUuid);
      await expectToCreateEventWithStatus(ApprovalStatus.approved, applicantUuid, offerUuid);
      await expectToCreateEventWithStatus(ApprovalStatus.rejected, applicantUuid, offerUuid);
    });

    it("creates an event with an offer association", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      const jobApplicationApprovalEvent = await JobApplicationApprovalEventRepository.create({
        offerUuid,
        applicantUuid,
        adminUserUuid: admin.userUuid,
        status: ApprovalStatus.pending
      });
      const offer = await jobApplicationApprovalEvent.getOffer();
      expect(offer.uuid).toEqual(offerUuid);
    });

    it("creates an event with an applicant association", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      const jobApplicationApprovalEvent = await JobApplicationApprovalEventRepository.create({
        offerUuid,
        applicantUuid,
        adminUserUuid: admin.userUuid,
        status: ApprovalStatus.pending
      });
      const applicant = await jobApplicationApprovalEvent.getApplicant();
      expect(applicant.uuid).toEqual(applicantUuid);
    });

    it("creates an event with an admin association", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      const jobApplicationApprovalEvent = await JobApplicationApprovalEventRepository.create({
        offerUuid,
        applicantUuid,
        adminUserUuid: admin.userUuid,
        status: ApprovalStatus.pending
      });
      const { userUuid } = await jobApplicationApprovalEvent.getAdmin();
      expect(userUuid).toEqual(admin.userUuid);
    });

    it("throws an error if the status has an undefined enum value", async () => {
      const { applicantUuid, offerUuid } = await createOfferAndApplicant();
      await expect(
        JobApplicationApprovalEventRepository.create({
          offerUuid,
          applicantUuid,
          adminUserUuid: admin.userUuid,
          status: "undefinedStatus" as ApprovalStatus
        })
      ).rejects.toThrowErrorWithMessage(ValidationError, isApprovalStatus.validate.isIn.msg);
    });
  });
});
