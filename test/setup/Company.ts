import { Company } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminTestSetup } from "./Admin";

export class CompanyTestSetup {
  public approved: Company;
  public rejected: Company;
  public pending: Company;
  public tasks: AdminTask[];
  public admins: AdminTestSetup;

  constructor(admins: AdminTestSetup) {
    this.admins = admins;
  }

  public async execute() {
    this.rejected = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: this.admins.extension
    });

    this.approved = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: this.admins.graduados
    });

    this.pending = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.pending,
      admin: this.admins.extension
    });

    this.tasks = [this.rejected, this.approved, this.pending];
  }
}
