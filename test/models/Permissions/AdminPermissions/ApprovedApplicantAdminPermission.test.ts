import { ApprovedApplicantAdminPermission } from "$models/Permissions/AdminPermissions/ApprovedApplicantAdminPermission";
import { Applicant } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UUID } from "$models/UUID";

describe("ApprovedApplicantAdminPermission", () => {
  let applicant: Applicant;

  beforeAll(() => {
    applicant = new Applicant({ padron: 1, userUuid: UUID.generate() });
  });

  it("returns true the applicant is approved", async () => {
    applicant.set({ approvalStatus: ApprovalStatus.approved });
    const permission = new ApprovedApplicantAdminPermission(applicant);
    expect(await permission.apply()).toBe(true);
  });

  it("returns false the applicant is rejected", async () => {
    applicant.set({ approvalStatus: ApprovalStatus.rejected });
    const permission = new ApprovedApplicantAdminPermission(applicant);
    expect(await permission.apply()).toBe(false);
  });

  it("returns false the applicant is pending", async () => {
    applicant.set({ approvalStatus: ApprovalStatus.pending });
    const permission = new ApprovedApplicantAdminPermission(applicant);
    expect(await permission.apply()).toBe(false);
  });
});
