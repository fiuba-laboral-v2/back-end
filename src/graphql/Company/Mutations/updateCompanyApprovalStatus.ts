import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

import { Database } from "$config";
import { CompanyRepository } from "$models/Company";
import { CompanyApprovalEventRepository } from "$models/Company/CompanyApprovalEvent";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyApprovalEvent } from "$models";

export const updateCompanyApprovalStatus = {
  type: GraphQLCompany,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    }
  },
  resolve: async (
    _: undefined,
    { uuid: companyUuid, approvalStatus: status }: IUpdateCompanyApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) => {
    const userUuid = currentUser.getAdminRole().adminUserUuid;
    const company = await CompanyRepository.findByUuid(companyUuid);
    company.set({ approvalStatus: status });
    const event = new CompanyApprovalEvent({ userUuid, companyUuid, status });

    return Database.transaction(async transaction => {
      await CompanyRepository.save(company, transaction);
      await CompanyApprovalEventRepository.save(event, transaction);
      return company;
    });
  }
};

interface IUpdateCompanyApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
