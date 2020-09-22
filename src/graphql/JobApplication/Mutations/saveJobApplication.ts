import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import {
  JobApplicationRepository,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { ApplicantRepository } from "$models/Applicant";
import { CurrentUser } from "$models/CurrentUser";

export const saveJobApplication = {
  type: GraphQLJobApplication,
  args: {
    offerUuid: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { offerUuid }: { offerUuid: string },
    { currentUser }: { currentUser: CurrentUser }
  ) => {
    const offer = await OfferRepository.findByUuid(offerUuid);
    const canSeeOffer = await currentUser.getPermissions().canSeeOffer(offer);
    if (!canSeeOffer) throw new OfferNotTargetedForApplicantError();

    const applicant = await ApplicantRepository.findByUuid(
      currentUser.getApplicant().applicantUuid
    );
    return JobApplicationRepository.apply(applicant, offer);
  }
};
