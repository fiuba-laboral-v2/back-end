import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantGenerator } from "$generators/Applicant";
import { Applicant } from "$models";
import { AdminTask } from "$models/AdminTask";
import { Secretary } from "$models/Admin";
import { applicantVisibleBy } from "./applicantVisibleBy";

export class ApplicantTestSetup {
  public approvedStudentAndGraduate: Applicant;
  public rejectedStudentAndGraduate: Applicant;
  public pendingStudentAndGraduate: Applicant;
  public approvedStudent: Applicant;
  public rejectedStudent: Applicant;
  public pendingStudent: Applicant;
  public approvedGraduate: Applicant;
  public rejectedGraduate: Applicant;
  public pendingGraduate: Applicant;
  public tasks: AdminTask[];

  public async execute() {
    const generator = ApplicantGenerator.instance;

    this.rejectedStudentAndGraduate = await generator.studentAndGraduate({
      status: ApprovalStatus.rejected
    });

    this.approvedStudentAndGraduate = await generator.studentAndGraduate({
      status: ApprovalStatus.approved
    });

    this.pendingStudentAndGraduate = await generator.studentAndGraduate({
      status: ApprovalStatus.pending
    });

    this.rejectedStudent = await generator.student({ status: ApprovalStatus.rejected });
    this.approvedStudent = await generator.student({ status: ApprovalStatus.approved });
    this.pendingStudent = await generator.student({ status: ApprovalStatus.pending });

    this.rejectedGraduate = await generator.graduate({ status: ApprovalStatus.rejected });
    this.approvedGraduate = await generator.graduate({ status: ApprovalStatus.approved });
    this.pendingGraduate = await generator.graduate({ status: ApprovalStatus.pending });

    this.tasks = [
      this.rejectedStudentAndGraduate,
      this.approvedStudentAndGraduate,
      this.pendingStudentAndGraduate,
      this.rejectedStudent,
      this.approvedStudent,
      this.pendingStudent,
      this.rejectedGraduate,
      this.approvedGraduate,
      this.pendingGraduate
    ].sort(task => -task.updatedAt);
  }

  public async tasksVisibleBy(secretary: Secretary) {
    const all: AdminTask[] = [];
    for (const task of this.tasks) {
      const isVisible = await applicantVisibleBy(task as Applicant, secretary);
      if (isVisible) all.push(task);
    }
    return all;
  }
}
