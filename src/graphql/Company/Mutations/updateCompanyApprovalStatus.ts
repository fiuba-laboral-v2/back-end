import { ID, nonNull } from "$graphql/fieldTypes";
import { CompanyRepository } from "$models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

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
    { uuid, approvalStatus }: IUpdateCompanyApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) =>
    CompanyRepository.updateApprovalStatus(
      currentUser.getAdmin().adminUserUuid,
      uuid,
      approvalStatus
    )
};

interface IUpdateCompanyApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
