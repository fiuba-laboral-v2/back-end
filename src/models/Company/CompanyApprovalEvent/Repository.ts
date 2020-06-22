import { ICreateCompanyApprovalEvent } from "./Interfaces";
import { CompanyApprovalEvent } from "./Model";

export const CompanyApprovalEventRepository = {
  create: async ({ admin, company, status, transaction }: ICreateCompanyApprovalEvent) =>
    CompanyApprovalEvent.create(
      {
        userUuid: admin.userUuid,
        companyUuid: company.uuid,
        status: status
      },
      { transaction }
    ),
  findAll: () => CompanyApprovalEvent.findAll(),
  truncate: () => CompanyApprovalEvent.truncate({ cascade: true })
};
