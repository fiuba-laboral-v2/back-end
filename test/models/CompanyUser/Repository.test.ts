import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Company, CompanyUser } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser/Repository";
import { ForeignKeyConstraintError } from "sequelize";
import { UUID } from "$models/UUID";

import { CompanyGenerator } from "$generators/Company";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { UserGenerator } from "$generators/User";
import { CuitGenerator } from "$generators/Cuit";
import { UUID_REGEX } from "$test/models";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("CompanyUserRepository", () => {
  const companyAttributes = {
    cuit: "30711819017",
    companyName: "Mercado Libre",
    businessName: "businessName"
  };

  beforeAll(() => Promise.all([CompanyRepository.truncate(), UserRepository.truncate()]));

  it("persists a company user in the database", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser).toBeObjectContaining(attributes);
  });

  it("sets its uuid after persisting the company user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("sets its timestamps after persisting the company user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser.createdAt).toEqual(expect.any(Date));
    expect(companyUser.updatedAt).toEqual(expect.any(Date));
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

  describe("findLatestByCompany", () => {
    const { findLatestByCompany } = CompanyUserRepository;
    const size = 20;
    let companyUsers: CompanyUser[] = [];
    let companyUuid: string;

    beforeAll(async () => {
      await CompanyUserRepository.truncate();

      const company = new Company({
        cuit: CuitGenerator.generate(),
        companyName: "devartis",
        businessName: "el zorro"
      });
      await CompanyRepository.save(company);
      companyUuid = company.uuid;
      companyUsers = await CompanyUserGenerator.range({ company, size });
    });

    it("finds all companyUsers", async () => {
      const result = await CompanyUserRepository.findLatestByCompany({ companyUuid });
      expect(result.results).toHaveLength(size);
      expect(result.shouldFetchMore).toBe(false);
    });

    it("finds the first three companyUsers", async () => {
      const itemsPerPage = 3;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: companyUsers[0].createdAt!,
        uuid: companyUsers[0].uuid!
      };
      const result = await findLatestByCompany({ updatedBeforeThan, companyUuid });
      expect(result.results).toHaveLength(itemsPerPage);
      expect(result.results.map(({ uuid }) => uuid)).toEqual(
        companyUsers.slice(1, itemsPerPage + 1).map(({ uuid }) => uuid)
      );
      expect(result.shouldFetchMore).toBe(true);
    });

    it("finds the last half of remaining notifications", async () => {
      const itemsPerPage = size / 2;
      mockItemsPerPage(itemsPerPage);
      const updatedBeforeThan = {
        dateTime: companyUsers[itemsPerPage - 1].createdAt!,
        uuid: companyUsers[itemsPerPage - 1].uuid!
      };
      const result = await findLatestByCompany({ updatedBeforeThan, companyUuid });
      const { shouldFetchMore, results } = result;
      expect(results).toHaveLength(itemsPerPage);
      expect(results.map(({ uuid }) => uuid)).toEqual(
        companyUsers.slice(itemsPerPage, size + 1).map(({ uuid }) => uuid)
      );
      expect(shouldFetchMore).toBe(false);
    });
  });
});
