import {
  AdminNotificationRepository,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";
import { EmailService } from "$services/Email";
import { UpdatedCompanyProfileAdminNotificationEmailSender } from "$services/EmailSender";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Secretary } from "$models/Admin";
import { SecretarySettings } from "$models";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

describe("UpdatedCompanyProfileAdminNotificationEmailSender", () => {
  const emailSendMock = jest.fn();
  let secretarySettings: SecretarySettings;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    secretarySettings = await SecretarySettingsRepository.findBySecretary(Secretary.graduados);
  });

  beforeEach(() => {
    emailSendMock.mockClear();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
  });

  it("sends an email to an applicant user that a the profile its been approved", async () => {
    const admin = await AdminGenerator.instance({ secretary: secretarySettings.secretary });
    const company = await CompanyGenerator.instance.withMinimumData();
    const notification = new UpdatedCompanyProfileAdminNotification({
      secretary: admin.secretary,
      companyUuid: company.uuid
    });
    await AdminNotificationRepository.save(notification);

    await UpdatedCompanyProfileAdminNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          params: {
            receiverEmails: [secretarySettings.email],
            sender: {
              email: "no-reply@fi.uba.ar",
              name: "[No responder] Bolsa de Trabajo FIUBA"
            },
            subject: "Perfil de empresa actualizado",
            body: `El perfil de la empresa '${company.companyName}' (baseUrl/subDomain/admin/empresas/${company.uuid}) ha sido actualizado.`
          }
        }
      ]
    ]);
  });
});
