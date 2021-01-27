import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { Applicant, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { UUID_REGEX } from "../index";
import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { OfferGenerator } from "$generators/Offer";

describe("Applicant", () => {
  it("creates a valid applicant", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: 1,
      description: "Batman"
    });
    await expect(applicant.validate()).resolves.not.toThrow();
  });

  it("creates an applicant with the correct attributes", async () => {
    const attributes = { userUuid: UUID.generate(), padron: 1, description: "Batman" };
    const applicant = new Applicant(attributes);
    expect(applicant).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("creates an applicant with pending approval status by default", async () => {
    const applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
    expect(applicant.approvalStatus).toEqual(ApprovalStatus.pending);
  });

  it("applies to an offer", async () => {
    const companyUuid = UUID.generate();
    const applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
    const offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid }));
    const jobApplication = applicant.applyTo(offer);
    expect(jobApplication).toBeInstanceOf(JobApplication);
    expect(jobApplication.offerUuid).toEqual(offer.uuid);
    expect(jobApplication.applicantUuid).toEqual(applicant.uuid);
  });

  it("throws an error if approval status is not part of the enum values", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: 98539,
      description: "Batman",
      approvalStatus: "undefinedApprovalStatus"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });

  it("throws an error if no userUuid is provided", async () => {
    const applicant = new Applicant({
      padron: 98539,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Applicant.userUuid cannot be null"
    );
  });

  it("throws an error if padron is 0", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: 0,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("throws an error if padron is negative", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: -243,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("throws an error if no padron is provided", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      description: "Batman"
    });

    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Applicant.padron cannot be null"
    );
  });

  it("throws an error if padron is null", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: null,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Applicant.padron cannot be null"
    );
  });

  describe("isRejected", () => {
    it("returns true if the applicant is rejected", () => {
      const approvalStatus = ApprovalStatus.rejected;
      const applicant = new Applicant({ userUuid: UUID.generate(), padron: 99999, approvalStatus });
      expect(applicant.isRejected()).toBe(true);
    });

    it("returns false if the applicant is approved", () => {
      const approvalStatus = ApprovalStatus.approved;
      const applicant = new Applicant({ userUuid: UUID.generate(), padron: 99999, approvalStatus });
      expect(applicant.isRejected()).toBe(false);
    });

    it("returns false if the applicant is pending", () => {
      const approvalStatus = ApprovalStatus.pending;
      const applicant = new Applicant({ userUuid: UUID.generate(), padron: 99999, approvalStatus });
      expect(applicant.isRejected()).toBe(false);
    });
  });
});
