import { ValidationError } from "sequelize";

import { Admin } from "$models";
import { Secretary } from "$models/Admin";

describe("Admin", () => {
  it("creates a valid admin", async () => {
    const userUuid = "fb047680-e2c0-4127-886b-170d0b474a98";
    const admin = new Admin({ userUuid, secretary: Secretary.extension });
    await expect(admin.validate()).resolves.not.toThrow();
    expect(admin).toEqual(expect.objectContaining({
      userUuid,
      secretary: Secretary.extension,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }));
  });

  it("throws an error if no userUuid is provided", async () => {
    const admin = new Admin({});
    await expect(
      admin.validate()
    ).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Admin.userUuid cannot be null"
    );
  });

  it("throws an error if no the secretary is not extension or graduados", async () => {
    const userUuid = "fb047680-e2c0-4127-886b-170d0b474a98";
    const admin = new Admin({ userUuid, secretary: "something" });
    await expect(
      admin.validate()
    ).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Secretary must be one of these values: extension,graduados"
    );
  });
});
