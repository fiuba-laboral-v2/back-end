import { ValidationError } from "sequelize";
import Database from "../../../src/config/Database";
import { CompanyPhoneNumber } from "../../../src/models/CompanyPhoneNumber";
import { PhoneNumberWithLettersError, InvalidPhoneNumberError } from "validations-fiuba-laboral-v2";

describe("companyPhoneNumber", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("creates a valid CompanyPhoneNumber", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: "1143076555",
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    await expect(companyPhoneNumber.validate()).resolves.not.toThrow();
  });

  it("throws an error if phoneNumber is null", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: null,
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.phoneNumber cannot be null"
    );
  });

  it("throws an error if companyUuid is null", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: "1143076555",
      companyUuid: null
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.companyUuid cannot be null"
    );
  });

  it("throws an error if no companyUuid is provided", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({ phoneNumber: "43076555" });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.companyUuid cannot be null"
    );
  });

  it("throws an error if no phoneNumber is provided", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.phoneNumber cannot be null"
    );
  });

  it("throws an error if phoneNumber and companyUuid are null", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: null,
      companyUuid: null
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.phoneNumber cannot be null"
    );
    await matcher.rejects.toThrow(
      "notNull Violation: CompanyPhoneNumber.companyUuid cannot be null"
    );
  });

  it("throws an error if phoneNumber has letters", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: "letters",
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(PhoneNumberWithLettersError.buildMessage());
  });

  it("throws an error if phoneNumber is an empty string", async () => {
    const companyPhoneNumber = new CompanyPhoneNumber({
      phoneNumber: "",
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    const matcher = expect(companyPhoneNumber.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow(InvalidPhoneNumberError.buildMessage(""));
  });
});
