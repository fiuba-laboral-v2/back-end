import {
  ApplicantNotificationRepository,
  RejectedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { RejectedJobApplicationApplicantNotificationEmailSender } from "$services/EmailSender";

import { UserRepository } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { AdminRepository, Secretary } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("RejectedJobApplicationApplicantNotificationEmailSender", () => {
  const emailSendMock = jest.fn();

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  beforeEach(() => {
    emailSendMock.mockClear();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
  });

  it("sends an email to an applicant user that a jobApplication has been approved", async () => {
    const companyAttributes = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyAttributes);
    const adminAttributes = AdminGenerator.data(Secretary.graduados);
    const admin = await AdminRepository.create(adminAttributes);
    const applicantAttributes = ApplicantGenerator.data.minimum();
    const applicant = await ApplicantRepository.create(applicantAttributes);
    const jobApplication = await JobApplicationGenerator.instance.toTheCompany(company.uuid);
    const offer = await OfferRepository.findByUuid(jobApplication.offerUuid);
    const notification = new RejectedJobApplicationApplicantNotification({
      jobApplicationUuid: jobApplication.uuid,
      moderatorUuid: admin.userUuid,
      notifiedApplicantUuid: applicant.uuid,
      moderatorMessage: "message"
    });
    await ApplicantNotificationRepository.save(notification);

    await RejectedJobApplicationApplicantNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [applicantAttributes.user.email],
          sender: {
            name: `${adminAttributes.user.name} ${adminAttributes.user.surname}`,
            email: adminAttributes.user.email
          },
          subject: "Postulación a oferta de trabajo rechazada",
          body: expect.stringContaining(
            `Tu postulación a la oferta de trabajo: ${offer.title} (baseUrl/subDomain/postulante/ofertas/${offer.uuid}) ha sido rechazada.` +
              "\n" +
              `Motivo de rechazo: ${notification.moderatorMessage}` +
              "\n" +
              "Para mas detalles se puede responder a este email" +
              "\n\n" +
              `Bolsa de Trabajo FIUBA`
          )
        }
      ]
    ]);
  });
});
