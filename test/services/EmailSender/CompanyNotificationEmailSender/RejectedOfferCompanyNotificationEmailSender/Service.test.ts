import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { RejectedOfferCompanyNotificationEmailSender } from "$services/EmailSender";

import { CompanyGenerator } from "$generators/Company";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { AdminRepository, Secretary } from "$models/Admin";

describe("RejectedOfferCompanyNotificationEmailSender", () => {
  const generator = CompanyNotificationGenerator.instance.rejectedOffer;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  it("sends an email to all company users that an offer has been approved", async () => {
    const companyAttributes = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyAttributes);
    const adminAttributes = AdminGenerator.data(Secretary.graduados);
    const admin = await AdminRepository.create(adminAttributes);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const notification = await generator({ company, admin });
    const offer = await OfferRepository.findByUuid(notification.offerUuid);

    const emailSendMock = jest.fn();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
    await RejectedOfferCompanyNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyAttributes.user.email],
          sender: {
            name: `${adminAttributes.user.name} ${adminAttributes.user.surname}`,
            email: settings.email
          },
          subject: "Oferta laboral rechazada",
          body: expect.stringContaining(
            `Tu oferta laboral ha sido rechazada: ${offer.title} (baseUrl/subDomain/empresa/ofertas/${offer.uuid}).` +
              "\n" +
              `Motivo de rechazo: ${notification.moderatorMessage}.` +
              "\n\n" +
              "Bolsa de Trabajo FIUBA."
          )
        }
      ]
    ]);
  });
});
