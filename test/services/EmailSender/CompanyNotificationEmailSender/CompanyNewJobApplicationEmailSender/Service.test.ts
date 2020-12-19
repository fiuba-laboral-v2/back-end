import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { NewJobApplicationCompanyNotificationEmailSender } from "$services/EmailSender";
import { EmailService } from "$services/Email";

import { CompanyGenerator } from "$generators/Company";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("NewJobApplicationCompanyNotificationEmailSender", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  it("sends an email to all company users that a new application has arrived", async () => {
    const companyAttributes = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyAttributes);
    const admin = await AdminGenerator.graduados();
    const adminUser = await UserRepository.findByUuid(admin.userUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const notification = await CompanyNotificationGenerator.instance.newJobApplication({
      company,
      admin
    });
    const emailSendMock = jest.fn();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
    await NewJobApplicationCompanyNotificationEmailSender.send(notification);

    const { offerUuid, applicantUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyAttributes.user.email],
          sender: {
            name: `${adminUser.name} ${adminUser.surname}`,
            email: settings.email
          },
          subject: "Nueva postulación a tu oferta laboral",
          body:
            `Nueva postulación a tu oferta laboral: ${offer.title} (baseUrl/subDomain/empresa/ofertas/${offerUuid}).` +
            "\n" +
            `Postulante: applicantName applicantSurname (baseUrl/subDomain/empresa/postulantes/${applicantUuid}).` +
            "\n\n" +
            "Bolsa de Trabajo FIUBA."
        }
      ]
    ]);
  });
});
