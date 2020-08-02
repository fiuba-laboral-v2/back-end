import { ICreateCompanyApprovalEvent } from "./Interfaces";
import { CompanyApprovalEvent } from "../..";

export const CompanyApprovalEventRepository = {
  create: async ({ adminUserUuid, company, status, transaction }: ICreateCompanyApprovalEvent) =>
    CompanyApprovalEvent.create(
      {
        userUuid: adminUserUuid,
        companyUuid: company.uuid,
        status: status
      },
      { transaction }
    ),
  findAll: () => CompanyApprovalEvent.findAll(),
  truncate: () => CompanyApprovalEvent.truncate({ cascade: true })
};
