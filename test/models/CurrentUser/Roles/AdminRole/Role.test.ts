import { AdminRole } from "$models/CurrentUser";
import { AdminPermissions } from "$models/Permissions";
import { UUID } from "$models/UUID";

describe("AdminRole", () => {
  it("returns an AdminPermissions instance", async () => {
    const role = new AdminRole(UUID.generate());
    expect(role.getPermissions()).toBeInstanceOf(AdminPermissions);
  });
});
