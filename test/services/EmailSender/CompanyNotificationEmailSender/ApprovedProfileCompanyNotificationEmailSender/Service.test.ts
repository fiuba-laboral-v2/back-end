import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { CompanyNotificationRepository } from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { ApprovedProfileCompanyNotificationEmailSender } from "$services/EmailSender";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("ApprovedProfileCompanyNotificationEmailSender", () => {
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
    const notification = new ApprovedProfileCompanyNotification({
      notifiedCompanyUuid: company.uuid,
      moderatorUuid: admin.userUuid
    });
    await CompanyNotificationRepository.save(notification);
    await ApprovedProfileCompanyNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyUser.email],
          sender: {
            name: `${adminUser.name} ${adminUser.surname}`,
            email: settings.email
          },
          subject: "Perfil aprobado",
          body:
            "Tu perfil ha sido aprobado: (baseUrl/subDomain/empresa/perfil)." +
            "\n\n" +
            "Graduados email signature"
        }
      ]
    ]);
  });
});
