import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { Secretary } from "$models/Admin";
import { IApolloServerContext } from "$graphql/Context";
import { OfferNotVisibleByCurrentUserError } from "../Queries/Errors";

export const expireOffer = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IExpireOffer, { currentUser }: IApolloServerContext) => {
    const offer = await OfferRepository.findByUuid(uuid);

    const canEdit = await currentUser.getCompany().getPermissions().canSeeOffer(offer);
    if (!canEdit) throw new OfferNotVisibleByCurrentUserError();

    offer.expire();

    return OfferRepository.save(offer);
  }
};

interface IExpireOffer {
  uuid: string;
  secretaries: Secretary[];
}
