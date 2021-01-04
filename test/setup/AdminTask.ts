import { AdminTask } from "$models/AdminTask";
import { Secretary } from "$models/Admin";
import { ApplicantTestSetup } from "./Applicant";
import { CompanyTestSetup } from "./Company";
import { OfferTestSetup } from "./Offer";
import { AdminTestSetup } from "./Admin";
import { JobApplicationTestSetup } from "./JobApplication";

export class AdminTaskTestSetup {
  public tasks: AdminTask[];

  public applicants: ApplicantTestSetup;
  public companies: CompanyTestSetup;
  public offers: OfferTestSetup;
  public jobApplications: JobApplicationTestSetup;
  public admins: AdminTestSetup;

  constructor({ graphqlSetup }: { graphqlSetup: boolean }) {
    this.admins = new AdminTestSetup({ graphqlSetup });
  }

  public async execute() {
    await this.admins.execute();

    this.applicants = new ApplicantTestSetup();
    this.companies = new CompanyTestSetup();
    this.offers = new OfferTestSetup(this.companies, this.admins);
    this.jobApplications = new JobApplicationTestSetup(this.applicants, this.offers);

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
      ...(await this.jobApplications.tasksVisibleBy(secretary))
    ];
    return this.sortTasks(allTasks);
  }

  public getApolloClient(secretary: Secretary) {
    if (secretary === Secretary.graduados) return this.admins.graduadosApolloClient;
    return this.admins.extensionApolloClient;
  }

  private sortTasks(tasks: AdminTask[]) {
    return tasks.sort((task1, task2) => {
      if (task1.updatedAt !== task2.updatedAt) {
        return task1.updatedAt < task2.updatedAt ? 1 : -1;
      }
      return task1.uuid < task2.uuid ? 1 : -1;
    });
  }
}
