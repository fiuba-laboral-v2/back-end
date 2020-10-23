import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { OfferNotVisibleByCurrentUserError } from "./Errors";
import { IApolloServerContext } from "$graphql/Context";

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
    { currentUser }: IApolloServerContext
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);
    const canSeeOffer = await currentUser.getPermissions().canSeeOffer(offer);
    if (!canSeeOffer) throw new OfferNotVisibleByCurrentUserError();
    return offer;
  }
};
