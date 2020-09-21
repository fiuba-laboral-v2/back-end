import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { CurrentUser } from "$models/CurrentUser";
import { OfferNotVisibleByCurrentUserError } from "./Errors";

export const getOfferByUuid = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { uuid }: { uuid: string },
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);
    const canSeeOffer = await currentUser.getPermissions().canSeeOffer(offer);
    if (!canSeeOffer) throw new OfferNotVisibleByCurrentUserError();
    return offer;
  }
};
