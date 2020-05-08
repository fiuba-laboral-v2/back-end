import { ValidationError } from "sequelize";
import { Company } from "../../../src/models/Company";
import { companyMocks } from "./mocks";
import Database from "../../../src/config/Database";
import {
  InvalidCuitError,
  WrongLengthCuitError,
  EmptyNameError,
  NameWithDigitsError
} from "validations-fiuba-laboral-v2";

describe("Company", () => {
  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("create a valid company", async () => {
    const companyAttributes = companyMocks.companyData();
    const company = new Company(companyAttributes);
    await expect(company.validate()).resolves.not.toThrow();
    expect(company.uuid).not.toBeUndefined();
    expect(company).toEqual(expect.objectContaining(companyAttributes));
  });

  it("throws an error if cuit is null", async () => {
    const company = new Company({ cuit: null, companyName: "devartis" });
    const matcher = expect(company.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow("notNull Violation: Company.cuit cannot be null");
  });

  it("throws an error if companyName is null", async () => {
    const company: Company = new Company({ cuit: "30711819017", companyName: null });
    const matcher = expect(company.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow("notNull Violation: Company.companyName cannot be null");
  });

  it("throws an error if companyName and cuit is null", async () => {
    const company: Company = new Company({ cuit: null, companyName: null });
    const matcher = expect(company.validate());
    await matcher.rejects.toThrow(ValidationError);
    await matcher.rejects.toThrow("notNull Violation: Company.cuit cannot be null");
    await matcher.rejects.toThrow("notNull Violation: Company.companyName cannot be null");
  });

  it("throws an error if cuit has invalid format", async () => {
    const company = new Company({ cuit: "30711819018", companyName: "devartis" });
    await expect(company.validate()).rejects.toThrow(InvalidCuitError.buildMessage());
  });

  it("throws an error if cuit has less than eleven digits", async () => {
    const company = new Company({ cuit: "30", companyName: "devartis" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if cuit has more than eleven digits", async () => {
    const company = new Company({ cuit: "3057341761199", companyName: "devartis" });
    await expect(company.validate()).rejects.toThrow(WrongLengthCuitError.buildMessage());
  });

  it("throws an error if name is empty", async () => {
    const company = new Company({ cuit: "30711819017", companyName: "" });
    await expect(company.validate()).rejects.toThrow(EmptyNameError.buildMessage());
  });

  it("should throw an error if name has digits", async () => {
    const company = new Company({ cuit: "30711819017", companyName: "Google34" });
    await expect(company.validate()).rejects.toThrow(NameWithDigitsError.buildMessage());
  });

  it("should throw an error if name has digits and cuit has more than eleven digits", async () => {
    const company = new Company({ cuit: "3057341761199", companyName: "Google34" });
    const matcher = expect(company.validate());
    await matcher.rejects.toThrow(NameWithDigitsError.buildMessage());
    await matcher.rejects.toThrow(WrongLengthCuitError.buildMessage());
  });
});
