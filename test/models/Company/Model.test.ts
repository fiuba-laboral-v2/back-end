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
  WrongLengthCuitError
} from "validations-fiuba-laboral-v2";

describe("Company", () => {
  it("creates a valid company", async () => {
    const companyData = {
      cuit: "30711819017",
      companyName: "companyName",
      businessName: "businessName",
      slogan: "slogan",
      description: "description",
      logo: "https://logo.png",
      website: "https://website.com/",
      email: "email@email.com",
      approvalStatus: ApprovalStatus.pending
    };
    const company = new Company(companyData);
    await expect(company.validate()).resolves.not.toThrow();
    expect(company).toEqual(
      expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        ...companyData
      })
    );
  });

  it("throws an error if cuit is null", async () => {
    const company = new Company({ cuit: null, companyName: "devartis", businessName: "el zorro" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null"
    );
  });

  it("throws an error if companyName is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: null,
      businessName: "el zorro"
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.companyName cannot be null"
    );
  });

  it("throws an error if businessName is null", async () => {
    const company: Company = new Company({
      cuit: "30711819017",
      companyName: "devartis",
      businessName: null
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.businessName cannot be null"
    );
  });

  it("throws an error if companyName and cuit is null and businessName", async () => {
    const company: Company = new Company({ cuit: null, companyName: null, businessName: null });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Company.cuit cannot be null,\n" +
        "notNull Violation: Company.companyName cannot be null,\n" +
        "notNull Violation: Company.businessName cannot be null"
    );
  });

  it("throws an error if cuit has invalid format", async () => {
    const company = new Company({
      cuit: "30711819018",
      companyName: "devartis",
      businessName: "el zorro2"
    });
    await expect(company.validate()).rejects.toThrow(InvalidCuitError.buildMessage());
  });

  it("throws an error if cuit has less than eleven digits", async () => {
    const company = new Company({ cuit: "30", companyName: "devartis", businessName: "el zorro" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if cuit has more than eleven digits", async () => {
    const company = new Company({
      cuit: "3057341761199",
      companyName: "devartis",
      businessName: "el zorro"
    });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if companyName is empty", async () => {
    const company = new Company({ cuit: "30711819017", companyName: "", businessName: "el zorro" });
    await expect(company.validate()).rejects.toThrow(EmptyNameError.buildMessage());
  });

  it("should throw an error if companyName has digits", async () => {
    const company = new Company({
      cuit: "30711819017",
      companyName: "Google34",
      businessName: "el zorro"
    });
    await expect(company.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
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
    const company = new Company({ cuit: "30711819017", companyName: "devartis", businessName: "" });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Validation notEmpty on businessName failed"
    );
  });

  it("throws an error if url has invalid format", async () => {
    const company = new Company({
      cuit: "30711819017",
      companyName: "Google34",
      businessName: "el zorro",
      website: "badURL"
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
      businessName: "el zorro",
      email: badEmail
    });
    await expect(company.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidEmailError.buildMessage(badEmail)
    );
  });
});
