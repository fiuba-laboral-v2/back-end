import { ApplicantRole } from "$models/CurrentUser";
import { ApplicantPermissions } from "$models/Permissions";
import { UUID } from "$models/UUID";

describe("ApplicantRole", () => {
  it("returns an ApplicantPermissions instance", async () => {
    const role = new ApplicantRole(UUID.generate());
    expect(role.getPermissions()).toBeInstanceOf(ApplicantPermissions);
  });
});
