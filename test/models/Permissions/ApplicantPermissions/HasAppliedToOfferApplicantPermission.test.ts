import { HasAppliedToOfferApplicantPermission } from "$models/Permissions/ApplicantPermissions/HasAppliedToOfferApplicantPermission";
import { Applicant, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";

describe("HasAppliedToOfferApplicantPermission", () => {
  let applicant: Applicant;
  let offer: Offer;

  const mockHasApplied = (hasApplied: boolean) =>
    jest.spyOn(JobApplicationRepository, "hasApplied").mockImplementation(async () => hasApplied);

  beforeAll(() => {
    applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: UUID.generate() }));
  });

  it("returns true if the applicant has applied to the offer", async () => {
    mockHasApplied(true);
    const permissions = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permissions.apply()).toBe(true);
  });

  it("returns false if the applicant has not applied to the offer", async () => {
    mockHasApplied(false);
    const permissions = new HasAppliedToOfferApplicantPermission(applicant, offer);
    expect(await permissions.apply()).toBe(false);
  });
});
