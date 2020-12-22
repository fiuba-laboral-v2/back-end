import { CompanyUser } from "$models";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { omit } from "lodash";

describe("CompanyUser", () => {
  const mandatoryAttributes = {
    companyUuid: UUID.generate(),
    userUuid: UUID.generate(),
    position: "RR.HH"
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

  it("throws an error if no companyUuid, no userUuid and no position are provided", async () => {
    const companyUser = new CompanyUser();
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(ValidationError, [
      "notNull Violation: CompanyUser.companyUuid cannot be null",
      "notNull Violation: CompanyUser.userUuid cannot be null",
      "notNull Violation: CompanyUser.position cannot be null"
    ]);
  });

  it("throws an error if no companyUuid is provided", async () => {
    const companyUser = new CompanyUser(omit(mandatoryAttributes, "companyUuid"));
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.companyUuid cannot be null"
    );
  });

  it("throws an error if no userUuid is provided", async () => {
    const companyUser = new CompanyUser(omit(mandatoryAttributes, "userUuid"));
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.userUuid cannot be null"
    );
  });

  it("throws an error if no position is provided", async () => {
    const companyUser = new CompanyUser(omit(mandatoryAttributes, "position"));
    await expect(companyUser.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: CompanyUser.position cannot be null"
    );
  });
});
