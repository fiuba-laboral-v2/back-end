import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantGenerator } from "$generators/Applicant";
import { Applicant } from "$models";
import { AdminTask } from "$models/AdminTask";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";

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
    this.rejectedStudentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.rejected
    );

    this.approvedStudentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.approved
    );

    this.pendingStudentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.pending
    );

    this.rejectedStudent = await ApplicantGenerator.instance.student(ApprovalStatus.rejected);
    this.approvedStudent = await ApplicantGenerator.instance.student(ApprovalStatus.approved);
    this.pendingStudent = await ApplicantGenerator.instance.student(ApprovalStatus.pending);

    this.rejectedGraduate = await ApplicantGenerator.instance.graduate(ApprovalStatus.rejected);
    this.approvedGraduate = await ApplicantGenerator.instance.graduate(ApprovalStatus.approved);
    this.pendingGraduate = await ApplicantGenerator.instance.graduate(ApprovalStatus.pending);

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
      const type = await (task as Applicant).getType();
      const graduateTypes = [ApplicantType.both, ApplicantType.graduate];
      const isGraduate = secretary === Secretary.graduados;
      if (isGraduate && graduateTypes.includes(type)) all.push(task);
      if (!isGraduate && !graduateTypes.includes(type)) all.push(task);
    }
    return all;
  }
}
