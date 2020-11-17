import { CompanyRole } from "$models/CurrentUser";
import { CompanyPermissions } from "$models/Permissions";
import { v4 as generateUuid } from "uuid";

describe("CompanyRole", () => {
  it("returns an CompanyPermissions instance", async () => {
    const role = new CompanyRole(generateUuid());
    expect(role.getPermissions()).toBeInstanceOf(CompanyPermissions);
  });
});
