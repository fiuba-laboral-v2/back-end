import {
  ApplicantNotificationRepository,
  RejectedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { RejectedJobApplicationApplicantNotificationEmailSender } from "$services/EmailSender";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";

describe("RejectedJobApplicationApplicantNotificationEmailSender", () => {
  const emailSendMock = jest.fn();

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  beforeEach(() => {
    emailSendMock.mockClear();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
  });

  it("sends an email to an applicant user that a jobApplication has been approved", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const admin = await AdminGenerator.graduados();
    const adminUser = await UserRepository.findByUuid(admin.userUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const applicant = await ApplicantGenerator.instance.studentAndGraduate();
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
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
          receiverEmails: [applicantUser.email],
          sender: {
            name: `${adminUser.name} ${adminUser.surname}`,
            email: settings.email
          },
          subject: "Postulación a oferta de trabajo rechazada",
          body:
            `Tu postulación a la oferta de trabajo: ${offer.title} (baseUrl/subDomain/postulante/ofertas/${offer.uuid}) ha sido rechazada.` +
            "\n" +
            `Motivo de rechazo: "${notification.moderatorMessage}"` +
            "\n" +
            "Para mas detalles se puede responder a este email." +
            "\n\n" +
            "Graduados email signature"
        }
      ]
    ]);
  });
});
