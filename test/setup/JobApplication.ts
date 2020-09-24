import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Applicant, JobApplication, Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { ApplicantTestSetup } from "./Applicant";
import { OfferTestSetup } from "./Offer";
import { JobApplicationRepository } from "$models/JobApplication";

export class JobApplicationTestSetup {
  public approvedByExtensionJobApplication: JobApplication;
  public rejectedByExtensionJobApplication: JobApplication;
  public pendingByExtensionJobApplication: JobApplication;
  public approvedByGraduadosJobApplication: JobApplication;
  public rejectedByGraduadosJobApplication: JobApplication;
  public pendingByGraduadosJobApplication: JobApplication;
  public graduadosAdmin: Admin;
  public extensionAdmin: Admin;
  public tasks: AdminTask[];
  public applicants: ApplicantTestSetup;
  public offers: OfferTestSetup;

  constructor(
    applicants: ApplicantTestSetup,
    offers: OfferTestSetup,
    graduadosAdmin: Admin,
    extensionAdmin: Admin
  ) {
    this.applicants = applicants;
    this.offers = offers;
    this.graduadosAdmin = graduadosAdmin;
    this.extensionAdmin = extensionAdmin;
  }

  public async execute() {
    this.approvedByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForBoth,
      ApprovalStatus.approved,
      this.extensionAdmin
    );

    this.rejectedByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForGraduates,
      ApprovalStatus.rejected,
      this.extensionAdmin
    );

    this.pendingByExtensionJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedOfferForStudents,
      ApprovalStatus.pending,
      this.extensionAdmin
    );

    this.approvedByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForBoth,
      ApprovalStatus.approved,
      this.graduadosAdmin
    );

    this.rejectedByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForGraduates,
      ApprovalStatus.rejected,
      this.graduadosAdmin
    );

    this.pendingByGraduadosJobApplication = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedOfferForStudents,
      ApprovalStatus.pending,
      this.graduadosAdmin
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
