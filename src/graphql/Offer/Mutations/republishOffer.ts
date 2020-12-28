import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { GraphQLOffer } from "../Types/GraphQLOffer";
import { Secretary } from "$models/Admin";
import { IApolloServerContext } from "$graphql/Context";
import { OfferNotVisibleByCurrentUserError } from "../Queries/Errors";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

export const republishOffer = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { uuid }: IRepublishOffer,
    { currentUser }: IApolloServerContext
  ) => {
    const offer = await OfferRepository.findByUuid(uuid);

    const canEdit = await currentUser.getCompanyRole().getPermissions().canSeeOffer(offer);
    if (!canEdit) throw new OfferNotVisibleByCurrentUserError();
    const {
      offerDurationInDays: graduadosOfferDurationInDays
    } = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);
    const {
      offerDurationInDays: studentsOfferDurationInDays
    } = await SecretarySettingsRepository.findBySecretary(Secretary.extension);

    offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);

    return OfferRepository.save(offer);
  }
};

interface IRepublishOffer {
  uuid: string;
}
