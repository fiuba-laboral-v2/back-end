import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { CurrentUser } from "$models/CurrentUser";
import { ApplicantRepository } from "$models/Applicant";
import { OfferNotVisibleByCurrentUserError } from "./Errors";

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
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const applicant = await ApplicantRepository.findByUuid(
      currentUser.getApplicant().applicantUuid
    );
    const offer = await OfferRepository.findByUuid(uuid);
    if (!(await offer.applicantCanApply(applicant))) throw new OfferNotVisibleByCurrentUserError();
    return offer;
  }
};
