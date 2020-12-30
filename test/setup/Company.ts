import { Company } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";

export class CompanyTestSetup {
  public approved: Company;
  public rejected: Company;
  public pending: Company;
  public tasks: AdminTask[];

  public async execute() {
    this.rejected = await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.rejected);
    this.approved = await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.approved);
    this.pending = await CompanyGenerator.instance.updatedWithStatus(ApprovalStatus.pending);

    this.tasks = [this.rejected, this.approved, this.pending];
  }
}
