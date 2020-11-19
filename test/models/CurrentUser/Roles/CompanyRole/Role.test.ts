import { CompanyRole } from "$models/CurrentUser";
import { CompanyPermissions } from "$models/Permissions";
import { UUID } from "$models/UUID";

describe("CompanyRole", () => {
  it("returns an CompanyPermissions instance", async () => {
    const role = new CompanyRole(UUID.generate());
    expect(role.getPermissions()).toBeInstanceOf(CompanyPermissions);
  });
});
