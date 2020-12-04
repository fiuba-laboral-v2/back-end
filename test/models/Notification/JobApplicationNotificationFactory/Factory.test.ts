import { JobApplicationNotificationFactory } from "$models/Notification";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Admin, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";
import { CuitGenerator } from "$generators/Cuit";
import moment from "moment";
import { ApplicantType } from "$models/Applicant";

describe("JobApplicationNotificationFactory", () => {
  let admin: Admin;
  let company: Company;
  let jobApplication: JobApplication;
  let offer: Offer;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

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

    offer = new Offer({
      companyUuid: company.uuid,
      title: "title",
      description: "description",
      isInternship: false,
      hoursPerDay: 8,
      minimumSalary: 52500,
      maximumSalary: 70000,
      graduatesExpirationDateTime: moment().endOf("day").add(7, "days"),
      studentsExpirationDateTime: moment().endOf("day").add(7, "days"),
      targetApplicantType: ApplicantType.both
    });
  });

  beforeEach(() => jest.spyOn(OfferRepository, "findByUuid").mockImplementation(async () => offer));

  it("return an array with a NewJobApplicationCompanyNotification", async () => {
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
