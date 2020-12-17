import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Company, CompanyUser } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser/Repository";
import { ForeignKeyConstraintError } from "sequelize";
import { UUID } from "$models/UUID";

import { CompanyGenerator } from "$generators/Company";
import { UserGenerator } from "$generators/User";

describe("CompanyUserRepository", () => {
  const companyAttributes = {
    cuit: "30711819017",
    companyName: "Mercado Libre",
    businessName: "businessName"
  };

  beforeEach(() => Promise.all([CompanyRepository.truncate(), UserRepository.truncate()]));

  it("successfully creates when both references are valid", async () => {
    const company = new Company(companyAttributes);
    await CompanyRepository.save(company);
    const user = await UserGenerator.instance();
    const companyUser = new CompanyUser({ companyUuid: company.uuid, userUuid: user.uuid });
    await CompanyUserRepository.save(companyUser);
    expect(companyUser).toBeObjectContaining({
      companyUuid: company.uuid,
      userUuid: user.uuid
    });
  });

  it("needs to reference a persisted company", async () => {
    const user = await UserGenerator.instance();
    const companyUser = new CompanyUser({ companyUuid: UUID.generate(), userUuid: user.uuid });
    await expect(CompanyUserRepository.save(companyUser)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_companyUuid_fkey"'
    );
  });

  it("needs to reference a persisted user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const companyUser = new CompanyUser({ companyUuid: company.uuid, userUuid: UUID.generate() });
    await expect(CompanyUserRepository.save(companyUser)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_userUuid_fkey"'
    );
  });

  describe("findByCompany", () => {
    it("finds all companyUsers from a given company", async () => {
      const company = new Company(companyAttributes);
      await CompanyRepository.save(company);
      const companyUuid = company.uuid;
      const firstUser = await UserGenerator.instance();
      const secondUser = await UserGenerator.instance();
      const firstCompanyUser = new CompanyUser({ companyUuid, userUuid: firstUser.uuid });
      const secondCompanyUser = new CompanyUser({ companyUuid, userUuid: secondUser.uuid });
      await CompanyUserRepository.save(firstCompanyUser);
      await CompanyUserRepository.save(secondCompanyUser);

      const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
      expect(companyUsers).toEqual(
        expect.arrayContaining(
          [firstCompanyUser, secondCompanyUser].map(({ userUuid }) =>
            expect.objectContaining({ companyUuid, userUuid })
          )
        )
      );
    });

    it("returns an empty array if the company is not persisted", async () => {
      const company = new Company(companyAttributes);
      const companyUsers = await CompanyUserRepository.findByCompanyUuid(company.uuid);
      expect(companyUsers).toEqual([]);
    });
  });
});
