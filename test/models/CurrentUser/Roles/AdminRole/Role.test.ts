import { AdminRole } from "$models/CurrentUser";
import { AdminPermissions } from "$models/Permissions";
import generateUuid from "uuid/v4";

describe("AdminRole", () => {
  it("returns an AdminPermissions instance", async () => {
    const role = new AdminRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(AdminPermissions);
  });
});
