import { ValidationError } from "sequelize";
import uuid from "uuid/v4";
import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

describe("Applicant", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("should create a valid applicant", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: 1,
      description: "Batman"
    });
    await expect(applicant.validate()).resolves.not.toThrow();
  });

  it("should throw an error if no userUuid is provided", async () => {
    const applicant = new Applicant({
      padron: 98539,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if padron is 0", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: 0,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrow(
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("should throw an error if padron is negative", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: -243,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrow(
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("should throw an error if no padron is provided", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      description: "Batman"
    });

    await expect(applicant.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if padron is null", async () => {
    const applicant = new Applicant({
      userUuid: uuid(),
      padron: null,
      description: "Batman"
    });
    await expect(applicant.validate()).rejects.toThrow(ValidationError);
  });
});
