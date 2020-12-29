import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import {
  JobApplicationRepository,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { JobApplication } from "$models";
import { OfferRepository } from "$models/Offer";
import { IApolloServerContext } from "$graphql/Context";

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
    { currentUser }: IApolloServerContext
  ) => {
    const { applicantUuid } = currentUser.getApplicantRole();
    const offer = await OfferRepository.findByUuid(offerUuid);
    const canSeeOffer = await currentUser.getPermissions().canSeeOffer(offer);
    if (!canSeeOffer) throw new OfferNotTargetedForApplicantError();

    const jobApplication = new JobApplication({ offerUuid, applicantUuid });
    await JobApplicationRepository.save(jobApplication);
    return jobApplication;
  }
};
