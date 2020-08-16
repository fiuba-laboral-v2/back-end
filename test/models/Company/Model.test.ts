import { ValidationError } from "sequelize";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID_REGEX } from "../index";
import {
  EmptyNameError,
  InvalidCuitError,
  InvalidEmailError,
  InvalidURLError,
  NameWithDigitsError,
  WrongLengthCuitError,
} from "validations-fiuba-laboral-v2";

describe("Company", () => {
  it("creates a valid company", async () => {
    const companyData = {
      cuit: "30711819017",
      companyName: "companyName",
      slogan: "slogan",
      description: "description",
      logo: "https://logo.png",
      website: "https://website.com/",
      email: "email@email.com",
      approvalStatus: ApprovalStatus.pending,
    };
    const company = new Company(companyData);
    await expect(company.validate()).resolves.not.toThrow();
    expect(company).toEqual(
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        ...companyData,
      })
    );
  });

  it("throws an error if cuit is null", async () => {
    const company = new Company({ cuit: null, companyName: "devartis" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null"
    );
  });

  it("throws an error if companyName is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null,
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.companyName cannot be null"
    );
  });

  it("throws an error if companyName and cuit is null", async () => {
    const company: Company = new Company({ cuit: null, companyName: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null,\n" +
        "notNull Violation: Company.companyName cannot be null"
    );
  });

  it("throws an error if cuit has invalid format", async () => {
    const company = new Company({
      cuit: "30711819018",
      companyName: "devartis",
    });
    await expect(company.validate()).rejects.toThrow(InvalidCuitError.buildMessage());
  });

  it("throws an error if cuit has less than eleven digits", async () => {
    const company = new Company({ cuit: "30", companyName: "devartis" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if cuit has more than eleven digits", async () => {
    const company = new Company({
      cuit: "3057341761199",
      companyName: "devartis",
    });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if name is empty", async () => {
    const company = new Company({ cuit: "30711819017", companyName: "" });
    await expect(company.validate()).rejects.toThrow(EmptyNameError.buildMessage());
  });

  it("should throw an error if name has digits", async () => {
    const company = new Company({
      cuit: "30711819017",
      companyName: "Google34",
    });
    await expect(company.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
  });

  it("throws an error if name has digits and cuit has more than eleven digits", async () => {
    const company = new Company({
      cuit: "3057341761199",
      companyName: "Google34",
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(ValidationError, [
      NameWithDigitsError.buildMessage(),
      WrongLengthCuitError.buildMessage(),
    ]);
  });

  it("throws an error if url has invalid format", async () => {
    const company = new Company({
      cuit: "30711819017",
      companyName: "Google34",
      website: "badURL",
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidURLError.buildMessage()
    );
  });

  it("throws an error if email has invalid format", async () => {
    const badEmail = "badEmail";
    const company = new Company({
      cuit: "30711819017",
      companyName: "Google34",
      email: badEmail,
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidEmailError.buildMessage(badEmail)
    );
  });
});
