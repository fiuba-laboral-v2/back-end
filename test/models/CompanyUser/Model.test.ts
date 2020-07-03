import { Database } from "../../../src/config/Database";
import { CompanyUser } from "../../../src/models/CompanyUser";
import { ValidationError } from "sequelize";
import generateUuid from "uuid/v4";

describe("CompanyUser", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("needs to reference a company and a user", () =>
    expect((new CompanyUser()).validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      [
        "notNull Violation: CompanyUser.companyUuid cannot be null",
        "notNull Violation: CompanyUser.userUuid cannot be null"
      ]
    )
  );

  it("needs to reference a company", async () =>
    expect((new CompanyUser({
      userUuid: generateUuid()
    })).validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.companyUuid cannot be null"
    )
  );

  it("needs to reference a user", async () =>
    expect((new CompanyUser({
      companyUuid: generateUuid()
    })).validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.userUuid cannot be null"
    )
  );

  it("is valid when both references are present", () =>
    expect((new CompanyUser({
      companyUuid: generateUuid(),
      userUuid: generateUuid()
    })).validate()).resolves.not.toThrow()
  );
});
