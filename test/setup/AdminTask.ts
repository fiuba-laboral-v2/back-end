import { ApolloServerTestClient } from "apollo-server-testing";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { TestClientGenerator } from "$generators/TestClient";
import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";
import { AdminTask } from "$models/AdminTask";
import { AdminGenerator } from "$generators/Admin";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { OfferRepository } from "$models/Offer";

export class AdminTaskTestSetup {
  public graduadosApolloClient: ApolloServerTestClient;
  public extensionApolloClient: ApolloServerTestClient;
  public extensionAdmin: Admin;
  public graduadosAdmin: Admin;
  public approvedCompany: Company;
  public rejectedCompany: Company;
  public pendingCompany: Company;
  public approvedApplicant: Applicant;
  public rejectedApplicant: Applicant;
  public pendingApplicant: Applicant;

  public approvedOfferForStudents: Offer;
  public approvedOfferForGraduates: Offer;
  public approvedOfferForBoth: Offer;
  public rejectedOfferForStudents: Offer;
  public rejectedOfferForGraduates: Offer;
  public rejectedOfferForBoth: Offer;
  public pendingOfferForStudents: Offer;
  public pendingOfferForGraduates: Offer;
  public pendingOfferForBoth: Offer;

  public approvedByExtensionJobApplication: JobApplication;
  public rejectedByExtensionJobApplication: JobApplication;
  public pendingByExtensionJobApplication: JobApplication;
  public approvedByGraduadosJobApplication: JobApplication;
  public rejectedByGraduadosJobApplication: JobApplication;
  public pendingByGraduadosJobApplication: JobApplication;
  public allTasksByDescUpdatedAt: AdminTask[];
  public graphqlSetup: boolean;

  constructor({ graphqlSetup }: { graphqlSetup: boolean }) {
    this.graphqlSetup = graphqlSetup;
  }

  public async execute() {
    await this.setAdmins();

    this.rejectedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: this.extensionAdmin
    });

    this.approvedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: this.extensionAdmin
    });

    this.pendingCompany = await CompanyGenerator.instance.updatedWithStatus();

    this.rejectedApplicant = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.rejected
    );

    this.approvedApplicant = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.approved
    );

    this.pendingApplicant = await ApplicantGenerator.instance.studentAndGraduate(
      ApprovalStatus.pending
    );

    const offers = await this.setOffers();

    this.pendingByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.extensionAdmin, status: ApprovalStatus.pending }
    );

    this.approvedByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.extensionAdmin, status: ApprovalStatus.approved }
    );

    this.rejectedByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.extensionAdmin, status: ApprovalStatus.rejected }
    );

    this.pendingByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.graduadosAdmin, status: ApprovalStatus.pending }
    );

    this.approvedByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.graduadosAdmin, status: ApprovalStatus.approved }
    );

    this.rejectedByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus(
      { admin: this.graduadosAdmin, status: ApprovalStatus.rejected }
    );

    this.allTasksByDescUpdatedAt = [
      this.rejectedCompany,
      this.approvedCompany,
      this.pendingCompany,
      this.rejectedApplicant,
      this.approvedApplicant,
      this.pendingApplicant,
      ...offers,
      ...(await this.getJobApplicationAssociations(this.pendingByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.approvedByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.rejectedByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.pendingByGraduadosJobApplication)),
      ...(await this.getJobApplicationAssociations(this.approvedByGraduadosJobApplication)),
      ...(await this.getJobApplicationAssociations(this.rejectedByGraduadosJobApplication))
    ].sort(task => -task.updatedAt);
  }

  public async allTasksByDescUpdatedAtForSecretary(secretary: Secretary) {
    let allTasks = this.filterOffers(this.allTasksByDescUpdatedAt, secretary);
    allTasks = await allTasks.filter(async task => {
      if (!(task instanceof Applicant)) return true;
      const type = await task.getType();
      const graduateTypes = [ApplicantType.both, ApplicantType.graduate];
      const isGraduate = secretary === Secretary.graduados;
      if (isGraduate && graduateTypes.includes(type)) return true;
      return !isGraduate && !graduateTypes.includes(type);
    });
    const all: AdminTask[] = [];
    for (const task of allTasks) {
      if (!(task instanceof Applicant)) {
        all.push(task);
        continue;
      }
      const type = await task.getType();
      const graduateTypes = [ApplicantType.both, ApplicantType.graduate];
      const isGraduate = secretary === Secretary.graduados;
      if (isGraduate && graduateTypes.includes(type)) all.push(task);
      if (!isGraduate && !graduateTypes.includes(type)) all.push(task);
    }
    allTasks = all;
    return allTasks.sort((task1, task2) => {
      if (task1.updatedAt !== task2.updatedAt) {
        return task1.updatedAt < task2.updatedAt ? 1 : -1;
      }
      return task1.uuid < task2.uuid ? 1 : -1;
    });
  }

  public getApolloClient(secretary: Secretary) {
    if (secretary === Secretary.graduados) return this.graduadosApolloClient;
    return this.extensionApolloClient;
  }

  private async setOffers() {
    this.rejectedOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.student
    });

    this.rejectedOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.graduate
    });

    this.rejectedOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.rejected,
      targetApplicantType: ApplicantType.both
    });
    this.rejectedOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.rejectedOfferForBoth.uuid,
      admin: this.extensionAdmin,
      status: ApprovalStatus.rejected
    });

    this.approvedOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.student
    });

    this.approvedOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.graduate
    });

    this.approvedOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.approved,
      targetApplicantType: ApplicantType.both
    });

    this.approvedOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.approvedOfferForBoth.uuid,
      admin: this.extensionAdmin,
      status: ApprovalStatus.approved
    });

    this.pendingOfferForStudents = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.student
    });

    this.pendingOfferForGraduates = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.graduate
    });

    this.pendingOfferForBoth = await OfferGenerator.instance.updatedWithStatus({
      admin: this.graduadosAdmin,
      companyUuid: this.approvedCompany.uuid,
      status: ApprovalStatus.pending,
      targetApplicantType: ApplicantType.both
    });

    this.pendingOfferForBoth = await OfferRepository.updateApprovalStatus({
      uuid: this.pendingOfferForBoth.uuid,
      admin: this.extensionAdmin,
      status: ApprovalStatus.pending
    });

    return [
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

  private async setAdmins() {
    if (this.graphqlSetup) {
      const extension = await TestClientGenerator.admin({ secretary: Secretary.extension });
      const graduados = await TestClientGenerator.admin({ secretary: Secretary.graduados });
      this.extensionAdmin = extension.admin;
      this.extensionApolloClient = extension.apolloClient;
      this.graduadosAdmin = graduados.admin;
      this.graduadosApolloClient = graduados.apolloClient;
    } else {
      this.extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
      this.graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });
    }
  }

  private async getJobApplicationAssociations(jobApplication: JobApplication) {
    const applicant = await jobApplication.getApplicant();
    const offer = await jobApplication.getOffer();
    const company = await offer.getCompany();
    return [applicant, company, offer, jobApplication];
  }

  private filterOffers(allTasksByDescUpdatedAt: AdminTask[], secretary: Secretary) {
    let targetApplicantType: ApplicantType;
    if (secretary === Secretary.graduados) {
      targetApplicantType = ApplicantType.graduate;
    } else {
      targetApplicantType = ApplicantType.student;
    }
    const posibleTargets = [ApplicantType.both, targetApplicantType];

    return allTasksByDescUpdatedAt.filter(task => {
      if (!(task instanceof Offer)) return true;
      return posibleTargets.includes(task.targetApplicantType);
    });
  }
}
