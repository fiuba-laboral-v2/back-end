import Database from "../../../src/config/Database";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { User, UserRepository } from "../../../src/models/User";
import { UserMocks } from "../User/mocks";
import { companyMocks } from "../Company/mocks";
import { CompanyUserRepository } from "../../../src/models/CompanyUser/Repository";
import { ForeignKeyConstraintError } from "sequelize";

describe("CompanyRepository", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  it("needs to reference a persisted company", async () => {
    const company = new Company(companyMocks.companyDataWithoutUser());
    const user = await User.create(UserMocks.userAttributes);
    await expect(CompanyUserRepository.create(company, user)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      "violates foreign key constraint \"CompanyUsers_companyUuid_fkey\""
    );
  });

  it("needs to reference a persisted user", async () => {
    const company = await Company.create(companyMocks.companyDataWithoutUser());
    const user = new User(UserMocks.userAttributes);
    await expect(CompanyUserRepository.create(company, user)).rejects.toThrowErrorWithMessage(
      ForeignKeyConstraintError,
      "violates foreign key constraint \"CompanyUsers_userUuid_fkey\""
    );
  });

  it("successfully creates when both references are valid", async () => {
    const company = await Company.create(companyMocks.companyData());
    const user = await User.create(UserMocks.userAttributes);
    const companyUser = await CompanyUserRepository.create(company, user);
    expect(companyUser.companyUuid).toEqual(company.uuid);
    expect(companyUser.userUuid).toEqual(user.uuid);
  });
});
