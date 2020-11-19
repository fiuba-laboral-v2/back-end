import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { UUID_REGEX } from "../index";
import { isApprovalStatus } from "$models/SequelizeModelValidators";

describe("Applicant", () => {
  it("creates a valid applicant", async () => {
    const applicant = new Applicant({
      userUuid: UUID.generate(),
      padron: 1,
      description: "Batman"
    });
    await expect(applicant.validate()).resolves.not.toThrow();
  });

  it("creates an applicant with pending approval status by default", async () => {
    const userUuid = UUID.generate();
    const applicant = new Applicant({
      userUuid,
      padron: 1,
      description: "Batman"
    });
    expect(applicant).toEqual(
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        userUuid,
        padron: 1,
        description: "Batman",
        approvalStatus: ApprovalStatus.pending
      })
    );
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
});
