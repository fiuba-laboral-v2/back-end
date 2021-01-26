import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { ApprovedOfferCompanyNotificationEmailSender } from "$services/EmailSender";
import { CompanyGenerator } from "$generators/Company";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";

describe("ApprovedOfferCompanyNotificationEmailSender", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  it("sends an email to all company users that an offer has been approved", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const [companyUser] = await UserRepository.findByCompanyUuid(company.uuid);
    const admin = await AdminGenerator.extension();
    const adminUser = await UserRepository.findByUuid(admin.userUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const notification = await CompanyNotificationGenerator.instance.approvedOffer({
      company,
      admin
    });
    const offer = await OfferRepository.findByUuid(notification.offerUuid);

    const emailSendMock = jest.fn();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
    await ApprovedOfferCompanyNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          params: {
            receiverEmails: [companyUser.email],
            sender: {
              name: `${adminUser.name} ${adminUser.surname}`,
              email: settings.email
            },
            subject: "Oferta laboral aprobada",
            body:
              `Tu oferta laboral ha sido aprobada: ${offer.title} (baseUrl/subDomain/empresa/ofertas/${offer.uuid}).` +
              "\n\n" +
              "Extensión email signature"
          },
          onError: expect.any(Function),
          onSuccess: expect.any(Function)
        }
      ]
    ]);
  });
});
