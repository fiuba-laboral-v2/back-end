import { DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import Database from "../../../src/config/Database";
import faker from "faker";
import { CompanyRepository, Company } from "../../../src/models/Company";
import {
  CompanyPhoneNumber,
  CompanyPhoneNumberRepository
} from "../../../src/models/CompanyPhoneNumber";

describe("CompanyPhoneNumberRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(() => CompanyRepository.truncate());

  afterAll(() => Database.close());

  it("creates several phoneNumbers for the same company", async () => {
    const phoneNumbers = ["1144444444", "1155555555", "1166666666"];
    const company = await CompanyRepository.create({ cuit: "30711819017", companyName: "name" });
    await expect(
      CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)
    ).resolves.not.toThrow();
  });

  it("throws an error if a phone number is repeated in a bulk create", async () => {
    const phoneNumbers = ["1144444444", "1144444444", "1166666666"];
    const company = await CompanyRepository.create({ cuit: "30711819017", companyName: "name" });
    await expect(
      CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)
    ).rejects.toThrow(UniqueConstraintError);
  });

  it("throws an error if a company has already the same phoneNumber", async () => {
    const phoneNumber = "1144444444";
    const company = await CompanyRepository.create({ cuit: "30711819017", companyName: "name" });
    await CompanyPhoneNumberRepository.create(phoneNumber, company);
    const matcher = expect(CompanyPhoneNumberRepository.create(phoneNumber, company));
    await matcher.rejects.toThrow(UniqueConstraintError);
    await matcher.rejects.toThrow("Validation error");
  });

  it("throws an databse contraint error if phoneNumber is very large", async () => {
    const company = await CompanyRepository.create({ cuit: "30711819017", companyName: "name" });
    const phoneNumber = new CompanyPhoneNumber({
      companyUuid: company.uuid,
      phoneNumber: faker.lorem.paragraph(7)
    });
    const matcher = expect(phoneNumber.save({ validate: false }));
    await matcher.rejects.toThrow(DatabaseError);
    await matcher.rejects.toThrow("value too long for type character varying(255)");
  });

  it("throws an error if company does not exist", async () => {
    const notSavedCompany = new Company({
      uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    const matcher = expect(
      CompanyPhoneNumberRepository.create("1144444444", notSavedCompany)
    );
    await matcher.rejects.toThrow(ForeignKeyConstraintError);
    await matcher.rejects.toThrow(
      "insert or update on table \"CompanyPhoneNumbers\" violates foreign " +
      "key constraint \"CompanyPhoneNumbers_companyUuid_fkey\""
    );
  });

  it("truncates phoneNumber by cascade when we remove its company", async () => {
    const company = await CompanyRepository.create({ cuit: "30711819017", companyName: "name" });
    await CompanyRepository.create({ cuit: "30701307115", companyName: "name" });
    await CompanyRepository.create({ cuit: "30703088534", companyName: "name" });
    await CompanyPhoneNumberRepository.create("1144444444", company);
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
    await company.destroy();
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(0);
  });

  it("does not truncate phoneNumber by cascade when we remove another company", async () => {
    const company = await CompanyRepository.create({
      cuit: "30711819017",
      companyName: "name"
    });
    const anotherCompany = await CompanyRepository.create({
      cuit: "30701307115",
      companyName: "name"
    });
    await CompanyPhoneNumberRepository.create("(011) 44444444", company);
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
    await anotherCompany.destroy();
    expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
  });
});
