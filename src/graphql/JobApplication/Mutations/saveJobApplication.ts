import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import {
  JobApplicationRepository,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { ApplicantRepository, ApplicantType } from "$models/Applicant";
import { AdminRepository } from "$models/Admin";
import { OfferRepository } from "$models/Offer";
import { IApolloServerContext } from "$graphql/Context";
import {
  JobApplicationNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { Secretary } from "$models/Admin";
import { Database } from "$config";
import { EmailSenderFactory } from "$models/EmailSenderFactory";

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

    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    const jobApplication = applicant.applyTo(offer);
    const type = await applicant.getType();
    let secretary = Secretary.graduados;
    if (type === ApplicantType.both) secretary = Secretary.graduados;
    if (type === ApplicantType.student) secretary = Secretary.extension;
    if (type === ApplicantType.graduate) secretary = Secretary.graduados;
    const admin = await AdminRepository.findFirstBySecretary(secretary);
    const [notification] = await JobApplicationNotificationFactory.create(jobApplication, admin);

    await Database.transaction(async transaction => {
      await JobApplicationRepository.save(jobApplication);
      const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
      await repository.save(notification, transaction);
    });

    const emailSender = EmailSenderFactory.create(notification);
    emailSender.send(notification);

    return jobApplication;
  }
};
