import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { Company, User } from "$models";
import { CompanyGenerator } from "$generators/Company";
import { UserGenerator } from "$generators/User";
import { CompanyUserRepository } from "$models/CompanyUser/Repository";
import { ForeignKeyConstraintError } from "sequelize";

describe("CompanyUserRepository", () => {
  beforeEach(() => Promise.all([CompanyRepository.truncate(), UserRepository.truncate()]));

  it("needs to reference a persisted company", async () => {
    const company = new Company({ cuit: "30711819017", companyName: "Mercado Libre" });
    const user = await UserGenerator.instance();
    await expect(CompanyUserRepository.create(company, user)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_companyUuid_fkey"'
    );
  });

  it("needs to reference a persisted user", async () => {
    const { user: userAttributes, ...companyAttributes } = CompanyGenerator.data.completeData();
    const company = await Company.create(companyAttributes);
    const user = new User(userAttributes);
    await expect(CompanyUserRepository.create(company, user)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      'violates foreign key constraint "CompanyUsers_userUuid_fkey"'
    );
  });

  it("successfully creates when both references are valid", async () => {
    const { user: userAttributes, ...companyAttributes } = CompanyGenerator.data.completeData();
    const company = await Company.create(companyAttributes);
    const user = await User.create(userAttributes);
    const companyUser = await CompanyUserRepository.create(company, user);
    expect(companyUser.companyUuid).toEqual(company.uuid);
    expect(companyUser.userUuid).toEqual(user.uuid);
  });

  it("generates a valid association", async () => {
    const { user: userAttributes, ...companyAttributes } = CompanyGenerator.data.completeData();
    const company = await Company.create(companyAttributes);
    const user = await User.create(userAttributes);

    await CompanyUserRepository.create(company, user);

    const userCompany = await user.getCompany();
    const [companyUser] = await company.getUsers();
    expect(userCompany!.uuid).toEqual(company.uuid);
    expect(companyUser!.uuid).toEqual(user.uuid);
  });

  describe("findByCompany", () => {
    it("finds all companyUsers from a given company", async () => {
      const { user: userAttributes, ...companyAttributes } = CompanyGenerator.data.completeData();
      const company = new Company(companyAttributes);
      await company.save();
      const firstUser = await UserGenerator.instance();
      const secondUser = await UserGenerator.instance();
      await CompanyUserRepository.create(company, firstUser);
      await CompanyUserRepository.create(company, secondUser);
      const companyUsers = await CompanyUserRepository.findByCompanyUuid(company.uuid);
      expect(companyUsers.map(({ userUuid }) => userUuid)).toEqual(
        expect.arrayContaining([firstUser.uuid, secondUser.uuid])
      );
    });

    it("returns an empty array if the company is not persisted", async () => {
      const company = new Company({ cuit: "30711819017", companyName: "Mercado Libre" });
      const companyUsers = await CompanyUserRepository.findByCompanyUuid(company.uuid);
      expect(companyUsers).toEqual([]);
    });
  });
});
