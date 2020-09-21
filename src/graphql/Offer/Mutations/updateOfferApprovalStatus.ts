import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository, AdminCannotModerateOfferError } from "$models/Offer";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { CurrentUser } from "$models/CurrentUser";
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
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdmin().adminUserUuid);
    const canModerateOffer = await currentUser.getPermissions().canModerateOffer(offer);
    if (!canModerateOffer) throw new AdminCannotModerateOfferError(admin, offer);

    return OfferRepository.updateApprovalStatus({
      uuid,
      admin,
      status: approvalStatus
    });
  }
};

interface IUpdateOfferApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
