import Database from "../../../src/config/Database";
import { CompanyUser } from "../../../src/models/CompanyUser";
import { CompanyRepository } from "../../../src/models/Company";
import { UserRepository } from "../../../src/models/User";
import { companyMockData } from "../Company/mocks";
import { UserMocks } from "../User/mocks";

const nonExistentUuid = "7f03fcfa-93a9-476b-881a-b81a7ea9dbd3";

describe("CompanyUser", () => {
  beforeAll(() => Database.setConnection());
  beforeEach(() => Promise.all([
    CompanyRepository.truncate(),
    UserRepository.truncate()
  ]));
  afterAll(() => Database.close());

  it("needs to reference a company", () =>
    expect(CompanyUser.create()).rejects.toThrow(
      "null value in column \"companyUuid\" violates not-null constraint"
    )
  );

  it("needs to reference a user", async () =>
    await expect(CompanyUser.create({
      companyUuid: (await CompanyRepository.create(companyMockData)).uuid
    })).rejects.toThrow(
      "null value in column \"userUuid\" violates not-null constraint"
    )
  );

  it("needs to reference an existing company", async () =>
    await expect(CompanyUser.create({
      companyUuid: nonExistentUuid,
      userUuid: (await UserRepository.create(UserMocks.userAttributes)).uuid
    })).rejects.toThrow(
      "violates foreign key constraint \"CompanyUsers_companyUuid_fkey\""
    )
  );

  it("needs to reference an existing user", async () =>
    await expect(CompanyUser.create({
      companyUuid: (await CompanyRepository.create(companyMockData)).uuid,
      userUuid: nonExistentUuid
    })).rejects.toThrow(
      "violates foreign key constraint \"CompanyUsers_userUuid_fkey\""
    )
  );

  it("successfully creates when both foreign keys are valid", async () => {
    const { uuid: companyUuid } = await CompanyRepository.create(companyMockData);
    const { uuid: userUuid } = await UserRepository.create(UserMocks.userAttributes);
    const companyUser = await CompanyUser.create({ companyUuid, userUuid });
    expect(companyUser.companyUuid).toEqual(companyUuid);
    expect(companyUser.userUuid).toEqual(userUuid);
  });
});
