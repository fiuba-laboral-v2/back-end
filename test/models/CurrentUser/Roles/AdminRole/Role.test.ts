import { AdminRole } from "$models/CurrentUser";
import { AdminPermissions } from "$models/Permissions";
import { v4 as generateUuid } from "uuid";

describe("AdminRole", () => {
  it("returns an AdminPermissions instance", async () => {
    const role = new AdminRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(AdminPermissions);
  });
});
