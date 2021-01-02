import { HasAppliedToOfferApplicantPermission } from "$models/Permissions/ApplicantPermissions/HasAppliedToOfferApplicantPermission";
import { Applicant, JobApplication, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("HasAppliedToOfferApplicantPermission", () => {
  let applicant: Applicant;
  let offer: Offer;
  let jobApplication: JobApplication;

  const mockRepository = () =>
    jest
      .spyOn(JobApplicationRepository, "findByApplicantAndOffer")
      .mockImplementation(async () => jobApplication);

  beforeAll(() => {
    applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: UUID.generate() }));
    jobApplication = applicant.applyTo(offer);
  });

  it("returns true if the applicant has an approved jobApplication", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.approved });
    mockRepository();
    const permission = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permission.apply()).toBe(true);
  });

  it("returns true if the applicant has a pending jobApplication", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.pending });
    mockRepository();
    const permission = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permission.apply()).toBe(true);
  });

  it("returns false if the applicant has a rejected jobApplication", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
    mockRepository();
    const permission = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permission.apply()).toBe(false);
  });

  it("returns false if the applicant has not applied to the offer", async () => {
    jest.spyOn(JobApplicationRepository, "findByApplicantAndOffer").mockImplementation(async () => {
      throw new Error();
    });
    const permission = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permission.apply()).toBe(false);
  });
});
