import { Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyTestSetup } from "./Company";
import { AdminTestSetup } from "./Admin";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { OfferRepository } from "$models/Offer";
import { Secretary } from "$models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

export class OfferTestSetup {
  public approvedForStudents: Offer;
  public approvedForGraduates: Offer;
  public approvedForBoth: Offer;
  public rejectedForStudents: Offer;
  public rejectedForGraduates: Offer;
  public rejectedForBoth: Offer;
  public pendingForStudents: Offer;
  public pendingForGraduates: Offer;
  public pendingForBoth: Offer;
  public tasks: AdminTask[];
  public companies: CompanyTestSetup;
  public admins: AdminTestSetup;

  constructor(companies: CompanyTestSetup, admins: AdminTestSetup) {
    this.companies = companies;
    this.admins = admins;
  }

  public async execute() {
    this.rejectedForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.student
    });

    this.rejectedForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.graduate
    });

    this.rejectedForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.both
    });
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      this.admins.extension.secretary
    );
    this.rejectedForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.rejectedForBoth.uuid,
      admin: this.admins.extension,
      offerDurationInDays,
      status: ApprovalStatus.rejected
    });

    this.approvedForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.student
    });

    this.approvedForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.graduate
    });

    this.approvedForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.approvedForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.approvedForBoth.uuid,
      admin: this.admins.extension,
      offerDurationInDays,
      status: ApprovalStatus.approved
    });

    this.pendingForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.student
    });

    this.pendingForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.graduate
    });

    this.pendingForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.both
    });

    this.pendingForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.pendingForBoth.uuid,
      admin: this.admins.extension,
      offerDurationInDays,
      status: ApprovalStatus.pending
    });

    this.tasks = [
      this.approvedForStudents,
      this.approvedForGraduates,
      this.approvedForBoth,
      this.rejectedForStudents,
      this.rejectedForGraduates,
      this.rejectedForBoth,
      this.pendingForStudents,
      this.pendingForGraduates,
      this.pendingForBoth
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
