import { ID, nonNull } from "../../fieldTypes";
import { CompanyRepository } from "../../../models/Company";
import { GraphQLCompany } from "../Types/GraphQLCompany";
import { IAdminUser } from "../../Context";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "../../../models/ApprovalStatus";

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
    { currentUser }: { currentUser: IAdminUser }
  ) => CompanyRepository.updateApprovalStatus(currentUser.admin.userUuid, uuid, approvalStatus)
};

interface IUpdateCompanyApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
