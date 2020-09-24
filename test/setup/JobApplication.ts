import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Applicant, JobApplication, Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { ApplicantTestSetup } from "./Applicant";
import { OfferTestSetup } from "./Offer";
import { AdminTestSetup } from "./Admin";
import { JobApplicationRepository } from "$models/JobApplication";

export class JobApplicationTestSetup {
  public approvedByExtension: JobApplication;
  public rejectedByExtension: JobApplication;
  public pendingByExtension: JobApplication;
  public approvedByGraduados: JobApplication;
  public rejectedByGraduados: JobApplication;
  public pendingByGraduados: JobApplication;
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
    this.approvedByExtension = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedForBoth,
      ApprovalStatus.approved,
      this.admins.extension
    );

    this.rejectedByExtension = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedForGraduates,
      ApprovalStatus.rejected,
      this.admins.extension
    );

    this.pendingByExtension = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.approvedForStudents,
      ApprovalStatus.pending,
      this.admins.extension
    );

    this.approvedByGraduados = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedForBoth,
      ApprovalStatus.approved,
      this.admins.graduados
    );

    this.rejectedByGraduados = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedForGraduates,
      ApprovalStatus.rejected,
      this.admins.graduados
    );

    this.pendingByGraduados = await this.createJobApplication(
      this.applicants.approvedStudentAndGraduate,
      this.offers.rejectedForStudents,
      ApprovalStatus.pending,
      this.admins.graduados
    );

    this.tasks = [
      this.pendingByExtension,
      this.approvedByExtension,
      this.rejectedByExtension,
      this.pendingByGraduados,
      this.approvedByGraduados,
      this.rejectedByGraduados
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
