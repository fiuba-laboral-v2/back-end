import { ValidationError } from "sequelize";
import uuid from "uuid/v4";
import { Database } from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { ApprovalStatus, approvalStatuses } from "../../../src/models/ApprovalStatus";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";
import { UUID_REGEX } from "../index";

describe("Applicant", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("creates a valid applicant", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: 1,
      description: "Batman"
    });
    await expect(applicant.validate()).resolves.not.toThrow();
  });

  it("creates an applicant with pending approval status by default", async () => {
    const userUuid = uuid();
    const applicant = new Applicant({
      userUuid,
      padron: 1,
      description: "Batman"
    });
    expect(applicant).toEqual(expect.objectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      userUuid,
      padron: 1,
      description: "Batman",
      approvalStatus: ApprovalStatus.pending
    }));
  });

  it("throws an error if approval status is not part of the enum values", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: 98539,
      description: "Batman",
      approvalStatus: "undefinedApprovalStatus"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `ApprovalStatus must be one of these values: ${approvalStatuses}`
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
      userUuid: uuid(),
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
      userUuid: uuid(),
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
      userUuid: uuid(),
      description: "Batman"
    });

    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Applicant.padron cannot be null"
    );
  });

  it("throws an error if padron is null", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: null,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Applicant.padron cannot be null"
    );
  });
});
