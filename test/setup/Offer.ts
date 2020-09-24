import { Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyTestSetup } from "./Company";
import { AdminTestSetup } from "./Admin";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { OfferRepository } from "$models/Offer";
import { Secretary } from "$models/Admin";

export class OfferTestSetup {
  public approvedOfferForStudents: Offer;
  public approvedOfferForGraduates: Offer;
  public approvedOfferForBoth: Offer;
  public rejectedOfferForStudents: Offer;
  public rejectedOfferForGraduates: Offer;
  public rejectedOfferForBoth: Offer;
  public pendingOfferForStudents: Offer;
  public pendingOfferForGraduates: Offer;
  public pendingOfferForBoth: Offer;
  public tasks: AdminTask[];
  public companies: CompanyTestSetup;
  public admins: AdminTestSetup;

  constructor(companies: CompanyTestSetup, admins: AdminTestSetup) {
    this.companies = companies;
    this.admins = admins;
  }

  public async execute() {
    this.rejectedOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.student
    });

    this.rejectedOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.graduate
    });

    this.rejectedOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.both
    });
    this.rejectedOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.rejectedOfferForBoth.uuid,
      admin: this.admins.extension,
      status: ApprovalStatus.rejected
    });

    this.approvedOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.student
    });

    this.approvedOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.graduate
    });

    this.approvedOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.approvedOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.approvedOfferForBoth.uuid,
      admin: this.admins.extension,
      status: ApprovalStatus.approved
    });

    this.pendingOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.student
    });

    this.pendingOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.graduate
    });

    this.pendingOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.both
    });

    this.pendingOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.pendingOfferForBoth.uuid,
      admin: this.admins.extension,
      status: ApprovalStatus.pending
    });

    this.tasks = [
      this.approvedOfferForStudents,
      this.approvedOfferForGraduates,
      this.approvedOfferForBoth,
      this.rejectedOfferForStudents,
      this.rejectedOfferForGraduates,
      this.rejectedOfferForBoth,
      this.pendingOfferForStudents,
      this.pendingOfferForGraduates,
      this.pendingOfferForBoth
    ];
  }

  public tasksVisibleBy(secretary: Secretary) {
    let targetApplicantType: ApplicantType;
    if (secretary === Secretary.graduados) {
      targetApplicantType = ApplicantType.graduate;
    } else {
      targetApplicantType = ApplicantType.student;
    }
    const posibleTargets = [ApplicantType.both, targetApplicantType];

    return this.tasks.filter(task => {
      if (!(task instanceof Offer)) return true;
      return posibleTargets.includes(task.targetApplicantType);
    });
  }
}
