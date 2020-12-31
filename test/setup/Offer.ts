import { Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyTestSetup } from "./Company";
import { AdminTestSetup } from "./Admin";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { OfferRepository } from "$models/Offer";
import { Secretary } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

export class OfferTestSetup {
  public approvedAndExpiredForBoth: Offer;
  public approvedForStudents: Offer;
  public approvedForGraduates: Offer;
  public approvedForBoth: Offer;
  public anotherApprovedForBoth: Offer;
  public rejectedForStudents: Offer;
  public rejectedForGraduates: Offer;
  public rejectedForBoth: Offer;
  public pendingForStudents: Offer;
  public pendingForGraduates: Offer;
  public pendingForBoth: Offer;
  public fromRejectedCompany: Offer;
  public fromPendingCompany: Offer;
  public tasks: AdminTask[];
  public companies: CompanyTestSetup;
  public admins: AdminTestSetup;

  constructor(companies: CompanyTestSetup, admins: AdminTestSetup) {
    this.companies = companies;
    this.admins = admins;
  }

  public async execute() {
    const {
      offerDurationInDays: extensionOfferDurationInDays
    } = await SecretarySettingsRepository.findBySecretary(this.admins.extension.secretary);

    const {
      offerDurationInDays: graduadosOfferDurationInDays
    } = await SecretarySettingsRepository.findBySecretary(this.admins.graduados.secretary);

    this.fromPendingCompany = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.extension,
      companyUuid: this.companies.pending.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.fromRejectedCompany = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.rejected.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

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

    this.rejectedForBoth.updateStatus(
      this.admins.extension,
      ApprovalStatus.rejected,
      extensionOfferDurationInDays
    );
    this.rejectedForBoth = await OfferRepository.save(this.rejectedForBoth);

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

    this.approvedAndExpiredForBoth = await OfferGenerator.instance.forStudentsAndGraduates({
      status: ApprovalStatus.approved,
      companyUuid: this.companies.approved.uuid
    });
    this.approvedAndExpiredForBoth.expire();
    await OfferRepository.save(this.approvedAndExpiredForBoth);

    this.approvedForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.approvedForBoth.updateStatus(
      this.admins.extension,
      ApprovalStatus.approved,
      extensionOfferDurationInDays
    );
    await OfferRepository.save(this.approvedForBoth);

    this.anotherApprovedForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.admins.graduados,
      companyUuid: this.companies.approved.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.anotherApprovedForBoth.updateStatus(
      this.admins.extension,
      ApprovalStatus.approved,
      extensionOfferDurationInDays
    );
    await OfferRepository.save(this.anotherApprovedForBoth);

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

    this.pendingForBoth.updateStatus(
      this.admins.graduados,
      ApprovalStatus.pending,
      graduadosOfferDurationInDays
    );
    this.pendingForBoth = await OfferRepository.save(this.pendingForBoth);

    this.tasks = [
      this.approvedForStudents,
      this.approvedForGraduates,
      this.approvedForBoth,
      this.anotherApprovedForBoth,
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
