import { nonNull, String } from "$graphql/fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import {
  JobApplicationNotFoundError,
  JobApplicationRepository,
  OfferNotTargetedForApplicantError
} from "$models/JobApplication";
import { ApplicantRepository, ApplicantType } from "$models/Applicant";
import { AdminRepository, Secretary } from "$models/Admin";
import { OfferRepository } from "$models/Offer";
import { IApolloServerContext } from "$graphql/Context";
import {
  JobApplicationNotificationFactory,
  NotificationRepositoryFactory
} from "$models/Notification";
import { Database } from "$config";
import { EmailSenderFactory } from "$models/EmailSenderFactory";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { ApprovalStatus } from "$models/ApprovalStatus";

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

    let jobApplication = applicant.applyTo(offer);
    try {
      jobApplication = await JobApplicationRepository.findByApplicantAndOffer(applicant, offer);
      if (jobApplication.isRejected()) {
        jobApplication.set({ approvalStatus: ApprovalStatus.pending });
      } else {
        jobApplication = applicant.applyTo(offer);
      }
    } catch (error) {
      if (!(error instanceof JobApplicationNotFoundError)) throw error;
    }

    const type = await applicant.getType();
    let secretary = Secretary.graduados;
    if (type === ApplicantType.both) secretary = Secretary.graduados;
    if (type === ApplicantType.student) secretary = Secretary.extension;
    if (type === ApplicantType.graduate) secretary = Secretary.graduados;
    const secretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);
    const admin = await AdminRepository.findFirstBySecretary(secretary);
    if (secretarySettings.automaticJobApplicationApproval) {
      jobApplication.set({ approvalStatus: ApprovalStatus.approved });
    }
    const notifications = await JobApplicationNotificationFactory.create(jobApplication, admin);

    await Database.transaction(async transaction => {
      await JobApplicationRepository.save(jobApplication);
      for (const notification of notifications) {
        const repository = NotificationRepositoryFactory.getRepositoryFor(notification);
        await repository.save(notification, transaction);
      }
    });

    for (const notification of notifications) {
      const emailSender = EmailSenderFactory.create(notification);
      emailSender.send(notification);
    }

    return jobApplication;
  }
};
