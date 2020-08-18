import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { IAdminUser } from "$graphql/Context";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminRepository } from "$models/Admin";

export const updateOfferApprovalStatus = {
  type: GraphQLOffer,
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
    { uuid, approvalStatus }: IUpdateOfferApprovalStatusArguments,
    { currentUser }: { currentUser: IAdminUser }
  ) => {
    const admin = await AdminRepository.findByUserUuid(currentUser.admin.userUuid);
    return OfferRepository.updateApprovalStatus({
      uuid,
      adminUserUuid: currentUser.admin.userUuid,
      secretary: admin.secretary,
      status: approvalStatus
    });
  }
};

interface IUpdateOfferApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
