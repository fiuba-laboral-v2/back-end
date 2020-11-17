import { ApplicantRole } from "$models/CurrentUser";
import { ApplicantPermissions } from "$models/Permissions";
import { v4 as generateUuid } from "uuid";

describe("ApplicantRole", () => {
  it("returns an ApplicantPermissions instance", async () => {
    const role = new ApplicantRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(ApplicantPermissions);
  });
});
