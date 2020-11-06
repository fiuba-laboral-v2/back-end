import { ApprovalStatus } from "$models/ApprovalStatus";
import { Applicant, JobApplication, Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { ApplicantTestSetup } from "./Applicant";
import { OfferTestSetup } from "./Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { Secretary } from "$models/Admin";
import { applicantVisibleBy } from "./applicantVisibleBy";

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

  constructor(applicants: ApplicantTestSetup, offers: OfferTestSetup) {
    this.applicants = applicants;
    this.offers = offers;
  }

  public async execute() {
    this.approvedByExtension = await this.createJobApplication(
      this.applicants.approvedStudent,
      this.offers.approvedForBoth,
      ApprovalStatus.approved
    );

    this.rejectedByExtension = await this.createJobApplication(
      this.applicants.approvedStudent,
      this.offers.approvedForStudents,
      ApprovalStatus.rejected
    );

    this.pendingByExtension = await this.createJobApplication(
      this.applicants.approvedStudent,
      this.offers.pendingForStudents,
      ApprovalStatus.pending
    );

    this.approvedByGraduados = await this.createJobApplication(
      this.applicants.approvedGraduate,
      this.offers.rejectedForBoth,
      ApprovalStatus.approved
    );

    this.rejectedByGraduados = await this.createJobApplication(
      this.applicants.approvedGraduate,
      this.offers.rejectedForGraduates,
      ApprovalStatus.rejected
    );

    this.pendingByGraduados = await this.createJobApplication(
      this.applicants.approvedGraduate,
      this.offers.pendingForGraduates,
      ApprovalStatus.pending
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

  public async tasksVisibleBy(secretary: Secretary) {
    const all: AdminTask[] = [];
    for (const task of this.tasks) {
      const applicant = await (task as JobApplication).getApplicant();
      const isVisible = await applicantVisibleBy(applicant, secretary);
      if (isVisible) all.push(task);
    }
    return all;
  }

  private async createJobApplication(applicant: Applicant, offer: Offer, status: ApprovalStatus) {
    const jobApplication = await JobApplicationRepository.apply(applicant, offer);
    jobApplication.set({ approvalStatus: status });
    return JobApplicationRepository.save(jobApplication);
  }
}
