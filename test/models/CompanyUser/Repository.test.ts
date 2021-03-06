import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Company, CompanyUser } from "$models";
import { CompanyUserRepository } from "$models/CompanyUser/Repository";
import { ForeignKeyConstraintError } from "sequelize";
import { CompanyUserNotFoundError } from "$models/CompanyUser";
import { UUID } from "$models/UUID";

import { CompanyGenerator } from "$generators/Company";
import { CompanyUserGenerator } from "$generators/CompanyUser";
import { UserGenerator } from "$generators/User";
import { CuitGenerator } from "$generators/Cuit";
import { UUID_REGEX } from "$test/models";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Nullable } from "$models/SequelizeModel";

describe("CompanyUserRepository", () => {
  const companyAttributes = {
    cuit: "30711819017",
    companyName: "Mercado Libre",
    businessName: "businessName",
    businessSector: "businessSector",
    hasAnInternshipAgreement: true
  };

  beforeAll(() => Promise.all([CompanyRepository.truncate(), UserRepository.truncate()]));

  it("persists a company user in the database", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid, position: "RRHH" };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser).toBeObjectContaining(attributes);
  });

  it("sets its uuid after persisting the company user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid, position: "RRHH" };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser.uuid).toEqual(expect.stringMatching(UUID_REGEX));
  });

  it("sets its timestamps after persisting the company user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: company.uuid, userUuid: user.uuid, position: "RRHH" };
    const companyUser = new CompanyUser(attributes);
    await CompanyUserRepository.save(companyUser);
    expect(companyUser.createdAt).toEqual(expect.any(Date));
    expect(companyUser.updatedAt).toEqual(expect.any(Date));
  });

  it("needs to reference a persisted company", async () => {
    const user = await UserGenerator.instance();
    const attributes = { companyUuid: UUID.generate(), userUuid: user.uuid, position: "RRHH" };
    const companyUser = new CompanyUser(attributes);
    await expect(CompanyUserRepository.save(companyUser)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_companyUuid_fkey"'
    );
  });

  it("needs to reference a persisted user", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const attributes = { userUuid: UUID.generate(), companyUuid: company.uuid, position: "RRHH" };
    const companyUser = new CompanyUser(attributes);
    await expect(CompanyUserRepository.save(companyUser)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_userUuid_fkey"'
    );
  });

  describe("findByUuid", () => {
    let company: Company;

    beforeAll(async () => {
      company = await CompanyGenerator.instance.withMinimumData();
    });

    it("finds a companyUser by uuid", async () => {
      const companyUser = await CompanyUserGenerator.instance({ company });
      const persistedCompanyUser = await CompanyUserRepository.findByUuid(companyUser.uuid!);
      expect(persistedCompanyUser.uuid).toEqual(companyUser.uuid);
    });

    it("throws an error if the given uuid does not belong to a persisted companyUser", async () => {
      const userUuid = UUID.generate();
      await expect(CompanyUserRepository.findByUuid(userUuid)).rejects.toThrowErrorWithMessage(
        CompanyUserNotFoundError,
        CompanyUserNotFoundError.buildMessage()
      );
    });
  });

  describe("findByUserUuid", () => {
    let company: Company;

    beforeAll(async () => {
      company = await CompanyGenerator.instance.withMinimumData();
    });

    it("finds a companyUser by the userUuid", async () => {
      const companyUser = await CompanyUserGenerator.instance({ company });
      const persistedCompanyUser = await CompanyUserRepository.findByUserUuid(companyUser.userUuid);
      expect(persistedCompanyUser.uuid).toEqual(companyUser.uuid);
    });

    it("throws an error if the given userUuid does not belong to a persisted companyUser", async () => {
      const userUuid = UUID.generate();
      await expect(CompanyUserRepository.findByUserUuid(userUuid)).rejects.toThrowErrorWithMessage(
        CompanyUserNotFoundError,
        CompanyUserNotFoundError.buildMessage()
      );
    });
  });

  describe("findByCompany", () => {
    it("finds all companyUsers from a given company", async () => {
      const company = new Company(companyAttributes);
      await CompanyRepository.save(company);
      const companyUuid = company.uuid;
      const firstUser = await UserGenerator.instance();
      const secondUser = await UserGenerator.instance();
      const firstCompanyUser = new CompanyUser({
        companyUuid,
        userUuid: firstUser.uuid,
        position: "RR.HH"
      });
      const secondCompanyUser = new CompanyUser({
        companyUuid,
        userUuid: secondUser.uuid,
        position: "CEO"
      });
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
    let companyUserUuids: Array<Nullable<string>>;
    let companyUuid: string;

    beforeAll(async () => {
      await CompanyUserRepository.truncate();

      const company = new Company({
        cuit: CuitGenerator.generate(),
        companyName: "devartis",
        businessName: "el zorro",
        businessSector: "businessSector",
        hasAnInternshipAgreement: true
      });
      await CompanyRepository.save(company);
      companyUuid = company.uuid;
      companyUsers = await CompanyUserGenerator.range({ company, size });
      companyUsers = companyUsers.sort(companyUser => companyUser.createdAt.getDate());
      companyUserUuids = companyUsers.map(({ uuid }) => uuid);
    });

    it("finds all companyUsers", async () => {
      const result = await CompanyUserRepository.findLatestByCompany({ companyUuid });
      expect(result.results).toHaveLength(size);
      expect(result.shouldFetchMore).toBe(false);
    });

    it("finds all companyUsers ordered by createdAt", async () => {
      const result = await CompanyUserRepository.findLatestByCompany({ companyUuid });
      const companyUser = await companyUsers[size / 2];
      companyUser.set({ position: "POSITION" });
      await CompanyUserRepository.save(companyUser);
      const resultUuids = result.results.map(({ uuid }) => uuid);
      expect(resultUuids).toEqual(companyUserUuids);
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

    it("finds the last half of remaining companyUsers", async () => {
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
