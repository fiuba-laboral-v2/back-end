import { Company } from "$models";
import { AdminTask } from "$models/AdminTask";
import { CompanyGenerator } from "$generators/Company";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminTestSetup } from "./Admin";

export class CompanyTestSetup {
  public approvedCompany: Company;
  public rejectedCompany: Company;
  public pendingCompany: Company;
  public tasks: AdminTask[];
  public admins: AdminTestSetup;

  constructor(admins: AdminTestSetup) {
    this.admins = admins;
  }

  public async execute() {
    this.rejectedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: this.admins.extension
    });

    this.approvedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: this.admins.graduadosAdmin
    });

    this.pendingCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.pending,
      admin: this.admins.extension
    });

    this.tasks = [this.rejectedCompany, this.approvedCompany, this.pendingCompany];
  }
}
