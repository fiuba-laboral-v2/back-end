import { JobApplicationNotificationFactory } from "$models/Notification";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Admin, Company, JobApplication } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";
import { CuitGenerator } from "$generators/Cuit";

describe("JobApplicationNotificationFactory", () => {
  let admin: Admin;
  let company: Company;
  let jobApplication: JobApplication;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    company = new Company({
      cuit: CuitGenerator.generate(),
      companyName: "companyName",
      businessName: "businessName"
    });
    jobApplication = new JobApplication({
      offerUuid: UUID.generate(),
      applicantUuid: UUID.generate()
    });
  });

  beforeEach(() =>
    jest.spyOn(CompanyRepository, "findByJobApplication").mockImplementation(async () => company)
  );

  it("return an array with a CompanyNewJobApplicationNotification", async () => {
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
