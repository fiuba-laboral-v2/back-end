import { CompanyUser } from "$models";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";

describe("CompanyUser", () => {
  const mandatoryAttributes = {
    companyUuid: UUID.generate(),
    userUuid: UUID.generate()
  };

  it("creates a valid companyUser", async () => {
    const companyUser = new CompanyUser(mandatoryAttributes);
    await expect(companyUser.validate()).resolves.not.toThrowError();
  });

  it("creates a valid companyUser with a null uuid", async () => {
    const companyUser = new CompanyUser(mandatoryAttributes);
    expect(companyUser.uuid).toBeNull();
  });

  it("creates a valid companyUser with null timestamps", async () => {
    const companyUser = new CompanyUser(mandatoryAttributes);
    expect(companyUser.createdAt).toBeUndefined();
    expect(companyUser.updatedAt).toBeUndefined();
  });

  it("throws an error if no companyUuid and no userUuid are provided", async () => {
    const companyUser = new CompanyUser();
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(ValidationError, [
      "notNull Violation: CompanyUser.companyUuid cannot be null",
      "notNull Violation: CompanyUser.userUuid cannot be null"
    ]);
  });

  it("throws an error if no companyUuid is provided", async () => {
    const companyUser = new CompanyUser({ userUuid: UUID.generate() });
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.companyUuid cannot be null"
    );
  });

  it("throws an error if no userUuid is provided", async () => {
    const companyUser = new CompanyUser({ companyUuid: UUID.generate() });
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.userUuid cannot be null"
    );
  });
});
