import { ValidationError } from "sequelize";
import { Admin } from "$models";
import { Secretary } from "$models/Admin";
import { isSecretary } from "$models/SequelizeModelValidators";
import { UUID } from "$models/UUID";

describe("Admin", () => {
  it("creates a an extension admin", async () => {
    const attributes = { userUuid: UUID.generate(), secretary: Secretary.extension };
    const admin = new Admin(attributes);
    await expect(admin.validate()).resolves.not.toThrow();
    expect(admin).toBeObjectContaining(attributes);
  });

  it("creates a a graduados admin", async () => {
    const attributes = { userUuid: UUID.generate(), secretary: Secretary.graduados };
    const admin = new Admin(attributes);
    await expect(admin.validate()).resolves.not.toThrow();
    expect(admin).toBeObjectContaining(attributes);
  });

  it("returns true if the admin is from extension secretary", async () => {
    const admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    expect(admin.isFromExtensionSecretary()).toBe(true);
  });

  it("returns true if the admin is from graduados secretary", async () => {
    const admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
    expect(admin.isFromGraduadosSecretary()).toBe(true);
  });

  it("throws an error if no userUuid is provided", async () => {
    const admin = new Admin({ secretary: Secretary.extension });
    await expect(admin.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Admin.userUuid cannot be null"
    );
  });

  it("throws an error if no secretary is provided", async () => {
    const admin = new Admin({ userUuid: UUID.generate() });
    await expect(admin.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Admin.secretary cannot be null"
    );
  });

  it("throws an error if the secretary is not extension or graduados", async () => {
    const admin = new Admin({ userUuid: UUID.generate(), secretary: "something" });
    await expect(admin.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `Validation error: ${isSecretary.validate.isIn.msg}`
    );
  });
});
