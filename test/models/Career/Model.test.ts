import { ValidationError } from "sequelize";
import { Career } from "$models";
import { NumberIsTooSmallError } from "validations-fiuba-laboral-v2";

describe("Career", () => {
  it("creates a valid applicant", async () => {
    const career = new Career({
      code: "10",
      description: "Ingeniería Informática",
      credits: 100,
    });

    await expect(career.validate()).resolves.not.toThrow();
  });

  it("throws an error if credits is 0", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: 0,
    });

    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("throws an error if credits is negative", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
      credits: -54,
    });

    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NumberIsTooSmallError.buildMessage(0, false)
    );
  });

  it("throws an error if code is null", async () => {
    const career: Career = new Career({
      description: "Ingeniería Informática",
      credits: 250,
    });

    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Career.code cannot be null"
    );
  });

  it("throws an error if description is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: null,
      credits: 250,
    });

    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Career.description cannot be null"
    );
  });

  it("throws an error if credits is null", async () => {
    const career: Career = new Career({
      code: "1",
      description: "Ingeniería Informática",
    });

    await expect(career.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Career.credits cannot be null"
    );
  });
});
