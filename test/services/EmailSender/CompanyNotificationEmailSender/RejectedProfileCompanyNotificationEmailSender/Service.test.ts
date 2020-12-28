import { RejectedProfileCompanyNotification } from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { RejectedProfileCompanyNotificationEmailSender } from "$services/EmailSender";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("RejectedProfileCompanyNotificationEmailSender", () => {
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

  it("sends an email to all company users that an offer has been approved", async () => {
    const company = await CompanyGenerator.instance.withMinimumData();
    const [companyUser] = await UserRepository.findByCompanyUuid(company.uuid);
    const admin = await AdminGenerator.graduados();
    const adminUser = await UserRepository.findByUuid(admin.userUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const notification = new RejectedProfileCompanyNotification({
      notifiedCompanyUuid: company.uuid,
      moderatorUuid: admin.userUuid,
      moderatorMessage: "message"
    });
    await CompanyNotificationRepository.save(notification);
    await RejectedProfileCompanyNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyUser.email],
          sender: {
            name: `${adminUser.name} ${adminUser.surname}`,
            email: settings.email
          },
          subject: "Perfil rechazado",
          body:
            "El perfil de tu empresa ha sido rechazado: (baseUrl/subDomain/empresa/perfil)." +
            "\n" +
            `Motivo de rechazo: "${notification.moderatorMessage}"` +
            "\n\n" +
            "Graduados email signature"
        }
      ]
    ]);
  });
});
