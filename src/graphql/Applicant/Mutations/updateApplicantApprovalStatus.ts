import { ID, nonNull } from "../../fieldTypes";
import { ApplicantRepository } from "../../../models/Applicant";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { IAdminUser } from "../../Context";
import { GraphQLApprovalStatus } from "../../ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "../../../models/ApprovalStatus";

export const updateApplicantApprovalStatus = {
  type: GraphQLApplicant,
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
    { uuid, approvalStatus }: IUpdateApplicantApprovalStatusArguments,
    { currentUser }: { currentUser: IAdminUser }
  ) => ApplicantRepository.updateApprovalStatus(currentUser.admin.userUuid, uuid, approvalStatus)
};

interface IUpdateApplicantApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
