import { GraphQLOffer } from "../Types/GraphQLOffer";
import { ID, nonNull } from "$graphql/fieldTypes";
import { OfferRepository } from "$models/Offer";
import { IApplicantUser } from "$graphql/Context";
import { ApplicantRepository } from "$models/Applicant";
import { OfferNotVisibleByApplicantError } from "./Errors";

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
    const offer = await OfferRepository.findByUuid(uuid);
    if (!(await offer.applicantCanApply(applicant))) throw new OfferNotVisibleByApplicantError();
    return offer;
  }
};
