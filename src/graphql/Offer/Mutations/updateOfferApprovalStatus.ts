import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository, AdminCannotModerateOfferError } from "$models/Offer";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminRepository } from "$models/Admin";
import { IApolloServerContext } from "$graphql/Context";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

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
    { currentUser }: IApolloServerContext
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);
    const admin = await AdminRepository.findByUserUuid(currentUser.getAdmin().adminUserUuid);
    const canModerateOffer = await currentUser.getPermissions().canModerateOffer(offer);
    if (!canModerateOffer) throw new AdminCannotModerateOfferError(admin, offer);
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      admin.secretary
    );

    return OfferRepository.updateApprovalStatus({
      uuid,
      admin,
      offerDurationInDays,
      status: approvalStatus
    });
  }
};

interface IUpdateOfferApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
