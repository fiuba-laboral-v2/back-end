import { ApplicantRole } from "$models/CurrentUser";
import { ApplicantPermissions } from "$models/Permissions";
import generateUuid from "uuid/v4";

describe("ApplicantRole", () => {
  it("returns an ApplicantPermissions instance", async () => {
    const role = new ApplicantRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(ApplicantPermissions);
  });
});
