import { JobApplicationNotificationFactory } from "$models/Notification";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { OfferRepository } from "$models/Offer";
import { Admin, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";

import { CuitGenerator } from "$generators/Cuit";
import { OfferGenerator } from "$generators/Offer";

describe("JobApplicationNotificationFactory", () => {
  let admin: Admin;
  let company: Company;
  let jobApplication: JobApplication;
  let offer: Offer;

  beforeAll(async () => {
    admin = new Admin({
      userUuid: UUID.generate(),
      secretary: Secretary.extension
    });

    company = new Company({
      uuid: UUID.generate(),
      cuit: CuitGenerator.generate(),
      companyName: "companyName",
      businessName: "businessName"
    });

    jobApplication = new JobApplication({
      offerUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });

    offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid }));
  });

  beforeEach(() => jest.spyOn(OfferRepository, "findByUuid").mockImplementation(async () => offer));

  it("return an array with a NewJobApplicationCompanyNotification and ApprovedJobApplicationApplicantNotification", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.approved });
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);
    expect(notifications).toHaveLength(1);
    const [firstNotification] = notifications;
    expect(firstNotification).toBeInstanceOf(NewJobApplicationCompanyNotification);
  });

  it("return an array with a the correct attributes", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.approved });
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);

    expect(notifications).toEqual([
      {
        uuid: undefined,
        moderatorUuid: admin.userUuid,
        notifiedCompanyUuid: company.uuid,
        jobApplicationUuid: jobApplication.uuid,
        isNew: true,
        createdAt: undefined
      }
    ]);
  });

  it("return an empty array if the jobApplication is rejected", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.rejected });
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);
    expect(notifications).toEqual([]);
  });

  it("return an empty array if the jobApplication is pending", async () => {
    jobApplication.set({ approvalStatus: ApprovalStatus.pending });
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);
    expect(notifications).toEqual([]);
  });
});
