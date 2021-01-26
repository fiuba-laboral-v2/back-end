import {
  ApplicantNotificationRepository,
  PendingJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { PendingJobApplicationApplicantNotificationEmailSender } from "$services/EmailSender";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { AdminGenerator } from "$generators/Admin";

describe("PendingJobApplicationApplicantNotificationEmailSender", () => {
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
    const notification = new PendingJobApplicationApplicantNotification({
      jobApplicationUuid: jobApplication.uuid,
      moderatorUuid: admin.userUuid,
      notifiedApplicantUuid: applicant.uuid
    });
    await ApplicantNotificationRepository.save(notification);

    await PendingJobApplicationApplicantNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          params: {
            receiverEmails: [applicantUser.email],
            sender: {
              name: `${adminUser.name} ${adminUser.surname}`,
              email: settings.email
            },
            subject: "Postulación a oferta de trabajo pendiente de aprobación",
            body:
              `Tu postulación a la oferta de trabajo: ${offer.title} (baseUrl/subDomain/postulante/ofertas/${offer.uuid}) será revisada por el personal de la FIUBA.` +
              "\n\n" +
              `Graduados email signature`
          },
          onError: expect.any(Function),
          onSuccess: expect.any(Function)
        }
      ]
    ]);
  });
});
