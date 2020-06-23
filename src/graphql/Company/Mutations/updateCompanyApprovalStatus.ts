import { ID, nonNull } from "../../fieldTypes";
import { CompanyRepository } from "../../../models/Company";
import { AdminRepository } from "../../../models/Admin";
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
    { uuid, approvalStatus }: IUpdateCompanyApprovalStatusArgs,
    { currentUser }: { currentUser: IAdminUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.admin.userUuid);
    const company = await CompanyRepository.findByUuid(uuid);
    return CompanyRepository.updateApprovalStatus(admin.userUuid, company, approvalStatus);
  }
};

interface IUpdateCompanyApprovalStatusArgs {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
