import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Applicant, JobApplication, Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { ApplicantTestSetup } from "./Applicant";
import { OfferTestSetup } from "./Offer";
import { AdminTestSetup } from "./Admin";
import { JobApplicationRepository } from "$models/JobApplication";

export class JobApplicationTestSetup {
  public approvedByExtensionJobApplication: JobApplication;
  public rejectedByExtensionJobApplication: JobApplication;
  public pendingByExtensionJobApplication: JobApplication;
  public approvedByGraduadosJobApplication: JobApplication;
  public rejectedByGraduadosJobApplication: JobApplication;
  public pendingByGraduadosJobApplication: JobApplication;
  public tasks: AdminTask[];
  public applicants: ApplicantTestSetup;
  public offers: OfferTestSetup;
  public admins: AdminTestSetup;

  constructor(applicants: ApplicantTestSetup, offers: OfferTestSetup, admins: AdminTestSetup) {
    this.applicants = applicants;
    this.offers = offers;
    this.admins = admins;
  }

  public async execute() {
    this.approvedByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForBoth,
      ApprovalStatus.approved,
      this.admins.extensionAdmin
    );

    this.rejectedByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForGraduates,
      ApprovalStatus.rejected,
      this.admins.extensionAdmin
    );

    this.pendingByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForStudents,
      ApprovalStatus.pending,
      this.admins.extensionAdmin
    );

    this.approvedByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForBoth,
      ApprovalStatus.approved,
      this.admins.graduadosAdmin
    );

    this.rejectedByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForGraduates,
      ApprovalStatus.rejected,
      this.admins.graduadosAdmin
    );

    this.pendingByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForStudents,
      ApprovalStatus.pending,
      this.admins.graduadosAdmin
    );

    this.tasks = [
      this.pendingByExtensionJobApplication,
      this.approvedByExtensionJobApplication,
      this.rejectedByExtensionJobApplication,
      this.pendingByGraduadosJobApplication,
      this.approvedByGraduadosJobApplication,
      this.rejectedByGraduadosJobApplication
    ];
  }

  private async createJobApplication(
    applicant: Applicant,
    offer: Offer,
    status: ApprovalStatus,
    admin: Admin
  ) {
    const jobApplication = await JobApplicationRepository.apply(applicant, offer);
    return await JobApplicationRepository.updateApprovalStatus({
      uuid: jobApplication.uuid,
      admin,
      status
    });
  }
}
