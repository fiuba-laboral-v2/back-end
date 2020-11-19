import { CompanyUser } from "$models";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";

describe("CompanyUser", () => {
  it("needs to reference a company and a user", () =>
    expect(new CompanyUser().validate()).rejects.toThrowErrorWithMessage(ValidationError, [
      "notNull Violation: CompanyUser.companyUuid cannot be null",
      "notNull Violation: CompanyUser.userUuid cannot be null"
    ]));

  it("needs to reference a company", async () =>
    expect(
      new CompanyUser({
        userUuid: UUID.generate()
      }).validate()
    ).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.companyUuid cannot be null"
    ));

  it("needs to reference a user", async () =>
    expect(
      new CompanyUser({
        companyUuid: UUID.generate()
      }).validate()
    ).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.userUuid cannot be null"
    ));

  it("is valid when both references are present", () =>
    expect(
      new CompanyUser({
        companyUuid: UUID.generate(),
        userUuid: UUID.generate()
      }).validate()
    ).resolves.not.toThrow());
});
