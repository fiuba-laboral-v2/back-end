import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { IApplicantUser } from "$graphql/Context";
import { ApplicantRepository } from "$models/Applicant";

export const getOfferVisibleByCurrentApplicant = {
  type: GraphQLOffer,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { uuid }: { uuid: string },
    { currentUser }: { currentUser: IApplicantUser }
  ) => {
    const applicant = await ApplicantRepository.findByUuid(currentUser.applicant.uuid);
    return OfferRepository.findByUuidTargetedTo(uuid, applicant);
  }
};
