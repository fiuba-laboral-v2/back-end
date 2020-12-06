import { Database } from "$config";
import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";

import { OfferRepository, AdminCannotModerateOfferError } from "$models/Offer";
import { OfferApprovalEventRepository } from "$models/Offer/OfferApprovalEvent";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { AdminRepository } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { OfferApprovalEvent } from "$models";

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
    { uuid, approvalStatus: status }: IUpdateOfferApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const canModerateOffer = await currentUser.getPermissions().canModerateOffer(offer);
    if (!canModerateOffer) throw new AdminCannotModerateOfferError(admin, offer);
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      admin.secretary
    );

    offer.updateStatus(admin, status);
    offer.updateExpirationDate(admin, offerDurationInDays);
    const event = new OfferApprovalEvent({ adminUserUuid, offerUuid: offer.uuid, status });
    return Database.transaction(async transaction => {
      await OfferRepository.save(offer, transaction);
      await OfferApprovalEventRepository.save(event, transaction);
      return offer;
    });
  }
};

interface IUpdateOfferApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
