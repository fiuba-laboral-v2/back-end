import { ApprovedCompanyForOfferAdminPermission } from "$models/Permissions/AdminPermissions/ApprovedCompanyForOfferAdminPermission";
import { Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { CuitGenerator } from "$generators/Cuit";

describe("ApprovedCompanyForOfferAdminPermission", () => {
  let company: Company;

  beforeAll(() => {
    const cuit = CuitGenerator.generate();
    company = new Company({ cuit, companyName: "name", businessName: "name" });
  });

  it("returns true the company is approved", async () => {
    company.set({ approvalStatus: ApprovalStatus.approved });
    const permission = new ApprovedCompanyForOfferAdminPermission(company);
    expect(await permission.apply()).toBe(true);
  });

  it("returns false the company is rejected", async () => {
    company.set({ approvalStatus: ApprovalStatus.rejected });
    const permission = new ApprovedCompanyForOfferAdminPermission(company);
    expect(await permission.apply()).toBe(false);
  });

  it("returns false the company is pending", async () => {
    company.set({ approvalStatus: ApprovalStatus.pending });
    const permission = new ApprovedCompanyForOfferAdminPermission(company);
    expect(await permission.apply()).toBe(false);
  });
});
