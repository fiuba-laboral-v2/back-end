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
  public approvedOffer: Offer;
  public rejectedOffer: Offer;
  public pendingOffer: Offer;
  public approvedByExtensionJobApplication: JobApplication;
  public rejectedByExtensionJobApplication: JobApplication;
  public pendingByExtensionJobApplication: JobApplication;
  public approvedByGraduadosJobApplication: JobApplication;
  public rejectedByGraduadosJobApplication: JobApplication;
  public pendingByGraduadosJobApplication: JobApplication;
  public allTasksByDescUpdatedAt: AdminTask[];
  public graphql: boolean;

  constructor(graphql: boolean) {
    this.graphql = graphql;
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

    this.rejectedApplicant = await ApplicantGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: this.extensionAdmin
    });

    this.approvedApplicant = await ApplicantGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: this.extensionAdmin
    });

    this.pendingApplicant = await ApplicantGenerator.instance.updatedWithStatus();

    const secretary = this.extensionAdmin.secretary;

    this.rejectedOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.rejected
    });

    this.approvedOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.approved
    });

    this.pendingOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: this.extensionAdmin,
      companyUuid: this.approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.pending
    });

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
      this.rejectedOffer,
      this.approvedOffer,
      this.pendingOffer,
      ...(await this.getJobApplicationAssociations(this.pendingByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.approvedByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.rejectedByExtensionJobApplication)),
      ...(await this.getJobApplicationAssociations(this.pendingByGraduadosJobApplication)),
      ...(await this.getJobApplicationAssociations(this.approvedByGraduadosJobApplication)),
      ...(await this.getJobApplicationAssociations(this.rejectedByGraduadosJobApplication))
    ].sort(task => -task.updatedAt);
  }

  public getApolloClient(secretary: Secretary) {
    if (secretary === Secretary.graduados) return this.graduadosApolloClient;
    return this.extensionApolloClient;
  }

  private async setAdmins() {
    if (this.graphql) {
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
}
