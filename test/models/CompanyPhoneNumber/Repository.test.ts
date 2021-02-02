import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { Company } from "$models";
import { CompanyRepository } from "$models/Company";
import { CompanyPhoneNumberRepository } from "$models/CompanyPhoneNumber";
import { UserRepository } from "$models/User";
import { CompanyGenerator } from "$generators/Company";

describe("CompanyPhoneNumberRepository", () => {
  beforeEach(() => Promise.all([CompanyRepository.truncate(), UserRepository.truncate()]));

  it("creates several phoneNumbers for the same company", async () => {
    const phoneNumbers = ["1144444444", "1155555555", "1166666666"];
    const company = await CompanyGenerator.instance.withCompleteData();
    await expect(
      CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)
    ).resolves.not.toThrow();
  });

  it("throws an error if a phone number is repeated in a bulk create", async () => {
    const phoneNumbers = ["1144444444", "1144444444", "1166666666"];
    const company = await CompanyGenerator.instance.withCompleteData();
    await expect(CompanyPhoneNumberRepository.bulkCreate(phoneNumbers, company)).rejects.toThrow(
      UniqueConstraintError
    );
  });

  it("throws an error if a company has already the same phoneNumber", async () => {
    const phoneNumber = "1144444444";
    const company = await CompanyGenerator.instance.withCompleteData();
    await CompanyPhoneNumberRepository.create(phoneNumber, company);
    await expect(
      CompanyPhoneNumberRepository.create(phoneNumber, company)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throws an error if company does not exist", async () => {
    const notSavedCompany = new Company({
      uuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    await expect(
      CompanyPhoneNumberRepository.create("1144444444", notSavedCompany)
    ).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'insert or update on table "CompanyPhoneNumbers" violates foreign ' +
        'key constraint "CompanyPhoneNumbers_companyUuid_fkey"'
    );
  });

  describe("delete cascade", () => {
    beforeEach(async () => {
      await UserRepository.truncate();
      await CompanyRepository.truncate();
    });

    it("truncates phoneNumber by cascade when we remove its company", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      await CompanyGenerator.instance.withMinimumData();
      await CompanyGenerator.instance.withMinimumData();
      await CompanyPhoneNumberRepository.create("1144444444", company);
      expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
      await company.destroy();
      expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(0);
    });

    it("does not truncate phoneNumber by cascade when we remove another company", async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      const anotherCompany = await CompanyGenerator.instance.withMinimumData();
      await CompanyPhoneNumberRepository.create("(011) 44444444", company);
      expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
      await anotherCompany.destroy();
      expect(await CompanyPhoneNumberRepository.findAll()).toHaveLength(1);
    });
  });
});
