import { ApolloServerTestClient } from "apollo-server-testing";
import { TestClientGenerator } from "$generators/TestClient";
import { Admin } from "$models";
import { AdminTask } from "$models/AdminTask";
import { AdminGenerator } from "$generators/Admin";
import { Secretary } from "$models/Admin";
import { ApplicantTestSetup } from "./Applicant";
import { CompanyTestSetup } from "./Company";
import { OfferTestSetup } from "./Offer";
import { JobApplicationTestSetup } from "./JobApplication";

export class AdminTaskTestSetup {
  public graduadosApolloClient: ApolloServerTestClient;
  public extensionApolloClient: ApolloServerTestClient;
  public extensionAdmin: Admin;
  public graduadosAdmin: Admin;

  public tasks: AdminTask[];
  public graphqlSetup: boolean;

  public applicants: ApplicantTestSetup;
  public companies: CompanyTestSetup;
  public offers: OfferTestSetup;
  public jobApplications: JobApplicationTestSetup;

  constructor({ graphqlSetup }: { graphqlSetup: boolean }) {
    this.graphqlSetup = graphqlSetup;
  }

  public async execute() {
    await this.setAdmins();

    this.applicants = new ApplicantTestSetup();
    this.companies = new CompanyTestSetup(this.extensionAdmin);
    this.offers = new OfferTestSetup(this.companies, this.extensionAdmin, this.graduadosAdmin);
    this.jobApplications = new JobApplicationTestSetup(
      this.applicants,
      this.offers,
      this.graduadosAdmin,
      this.extensionAdmin
    );
    await this.companies.execute();
    await this.applicants.execute();
    await this.offers.execute();
    await this.jobApplications.execute();

    this.tasks = this.sortTasks([
      ...this.applicants.tasks,
      ...this.companies.tasks,
      ...this.offers.tasks,
      ...this.jobApplications.tasks
    ]);
  }

  public async allTasksByDescUpdatedAtForSecretary(secretary: Secretary) {
    const allTasks = [
      ...(await this.applicants.tasksVisibleBy(secretary)),
      ...this.companies.tasks,
      ...this.offers.tasksVisibleBy(secretary),
      ...this.jobApplications.tasks
    ];
    return this.sortTasks(allTasks);
  }

  public getApolloClient(secretary: Secretary) {
    if (secretary === Secretary.graduados) return this.graduadosApolloClient;
    return this.extensionApolloClient;
  }

  private sortTasks(tasks: AdminTask[]) {
    return tasks.sort((task1, task2) => {
      if (task1.updatedAt !== task2.updatedAt) {
        return task1.updatedAt < task2.updatedAt ? 1 : -1;
      }
      return task1.uuid < task2.uuid ? 1 : -1;
    });
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
}
