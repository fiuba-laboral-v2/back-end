import { Admin, Company } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class CompanyTestSetup {
  public approvedCompany: Company;
  public rejectedCompany: Company;
  public pendingCompany: Company;
  public tasks: AdminTask[];

  private readonly extensionAdmin: Admin;

  constructor(extensionAdmin: Admin) {
    this.extensionAdmin = extensionAdmin;
  }

  public async execute() {
    this.rejectedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: this.extensionAdmin
    });

    this.approvedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: this.extensionAdmin
    });

    this.pendingCompany = await CompanyGenerator.instance.updatedWithStatus();

    this.tasks = [this.rejectedCompany, this.approvedCompany, this.pendingCompany];
  }
}
