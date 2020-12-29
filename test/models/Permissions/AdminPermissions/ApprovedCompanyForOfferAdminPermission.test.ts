import { ApprovedCompanyForOfferAdminPermission } from "$models/Permissions/AdminPermissions/ApprovedCompanyForOfferAdminPermission";
import { Company, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyRepository } from "$models/Company";

import { OfferGenerator } from "$generators/Offer";
import { CuitGenerator } from "$generators/Cuit";

describe("ApprovedCompanyForOfferAdminPermission", () => {
  let offer: Offer;
  let company: Company;

  const mockRepository = (approvalStatus: ApprovalStatus) => {
    company.set({ approvalStatus });
    jest.spyOn(CompanyRepository, "findByUuid").mockImplementation(async () => company);
  };

  beforeAll(() => {
    const cuit = CuitGenerator.generate();
    company = new Company({ cuit, companyName: "name", businessName: "name" });
    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid }));
  });

  it("returns true the company is approved", async () => {
    mockRepository(ApprovalStatus.approved);
    const permission = new ApprovedCompanyForOfferAdminPermission(offer);
    expect(await permission.apply()).toBe(true);
  });

  it("returns false the company is rejected", async () => {
    mockRepository(ApprovalStatus.rejected);
    const permission = new ApprovedCompanyForOfferAdminPermission(offer);
    expect(await permission.apply()).toBe(false);
  });

  it("returns false the company is pending", async () => {
    mockRepository(ApprovalStatus.pending);
    const permission = new ApprovedCompanyForOfferAdminPermission(offer);
    expect(await permission.apply()).toBe(false);
  });
});
