import { CompanyRole } from "$models/CurrentUser";
import { CompanyPermissions } from "$models/Permissions";
import generateUuid from "uuid/v4";

describe("CompanyRole", () => {
  it("returns an CompanyPermissions instance", async () => {
    const role = new CompanyRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(CompanyPermissions);
  });
});
