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
  NameIsTooLargeError
} from "validations-fiuba-laboral-v2";
import { CuitGenerator } from "$generators/Cuit";

describe("Company", () => {
  const mandatoryAttributes = {
    cuit: CuitGenerator.generate(),
    companyName: "companyName",
    businessName: "businessName",
    businessSector: "businessSector",
    hasAnInternshipAgreement: true
  };

  it("creates a valid company", async () => {
    const companyData = {
      ...mandatoryAttributes,
      slogan: "slogan",
      description: "description",
      logo: "https://logo.png",
      website: "https://website.com/",
      email: "email@email.com",
      approvalStatus: ApprovalStatus.pending
    };
    const company = new Company(companyData);
    await expect(company.validate()).resolves.not.toThrow();
    expect(company).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...companyData
    });
  });

  it("throws an error if cuit is null", async () => {
    const company = new Company({ ...mandatoryAttributes, cuit: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null"
    );
  });

  it("throws an error if companyName is null", async () => {
    const company: Company = new Company({ ...mandatoryAttributes, companyName: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.companyName cannot be null"
    );
  });

  it("throws an error if businessSector is null", async () => {
    const company: Company = new Company({ ...mandatoryAttributes, businessSector: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.businessSector cannot be null"
    );
  });

  it("throws an error if businessName is null", async () => {
    const company: Company = new Company({ ...mandatoryAttributes, businessName: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.businessName cannot be null"
    );
  });

  it("throws an error if hasAnInternshipAgreement is null", async () => {
    const company: Company = new Company({
      ...mandatoryAttributes,
      hasAnInternshipAgreement: null
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.hasAnInternshipAgreement cannot be null"
    );
  });

  it("throws an error if companyName, cuit, businessName and businessSector are null", async () => {
    const company: Company = new Company({
      cuit: null,
      companyName: null,
      businessName: null,
      businessSector: null
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null,\n" +
        "notNull Violation: Company.companyName cannot be null,\n" +
        "notNull Violation: Company.businessName cannot be null,\n" +
        "notNull Violation: Company.businessSector cannot be null"
    );
  });

  it("throws an error if cuit has invalid format", async () => {
    const company = new Company({ ...mandatoryAttributes, cuit: "30711819018" });
    await expect(company.validate()).rejects.toThrow(InvalidCuitError.buildMessage());
  });

  it("throws an error if cuit has less than eleven digits", async () => {
    const company = new Company({ ...mandatoryAttributes, cuit: "30" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if cuit has more than eleven digits", async () => {
    const company = new Company({ ...mandatoryAttributes, cuit: "3057341761199" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if companyName is empty", async () => {
    const company = new Company({ ...mandatoryAttributes, companyName: "" });
    await expect(company.validate()).rejects.toThrow(EmptyNameError.buildMessage());
  });

  it("throws an error if companyName has digits", async () => {
    const company = new Company({ ...mandatoryAttributes, companyName: "Google34" });
    await expect(company.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
  });

  it("throws an error if companyName has more than a hundred digits", async () => {
    const company = new Company({ ...mandatoryAttributes, companyName: "Google".repeat(101) });
    await expect(company.validate()).rejects.toThrow(NameIsTooLargeError.buildMessage(100));
  });

  it("throws an error if companyName has digits and cuit has more than eleven digits", async () => {
    const company = new Company({
      cuit: "3057341761199",
      companyName: "Google34",
      businessName: "el zorro"
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(ValidationError, [
      NameWithDigitsError.buildMessage(),
      WrongLengthCuitError.buildMessage()
    ]);
  });

  it("throws an error if businessName is empty", async () => {
    const company = new Company({ ...mandatoryAttributes, businessName: "" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Validation notEmpty on businessName failed"
    );
  });

  it("throws an error if businessSector is empty", async () => {
    const company = new Company({ ...mandatoryAttributes, businessSector: "" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Validation notEmpty on businessSector failed"
    );
  });

  it("throws an error if url has invalid format", async () => {
    const company = new Company({ ...mandatoryAttributes, website: "badURL" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidURLError.buildMessage()
    );
  });

  it("throws an error if email has invalid format", async () => {
    const badEmail = "badEmail";
    const company = new Company({ ...mandatoryAttributes, email: badEmail });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidEmailError.buildMessage(badEmail)
    );
  });
});
