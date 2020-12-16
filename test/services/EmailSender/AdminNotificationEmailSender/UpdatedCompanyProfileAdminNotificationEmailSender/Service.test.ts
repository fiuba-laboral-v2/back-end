import {
  UpdatedCompanyProfileAdminNotification,
  AdminNotificationRepository
} from "$models/AdminNotification";
import { EmailService } from "$services/Email";
import { UpdatedCompanyProfileAdminNotificationEmailSender } from "$services/EmailSender";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { AdminRepository, Secretary } from "$models/Admin";

import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("UpdatedCompanyProfileAdminNotificationEmailSender", () => {
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

  it("sends an email to an applicant user that a the profile its been approved", async () => {
    const adminAttributes = AdminGenerator.data(Secretary.graduados);
    const admin = await AdminRepository.create(adminAttributes);
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
          receiverEmails: [""],
          sender: {
            email: "bolsa.de.trabajo.notify@fi.uba.ar",
            name: "No contestar a este correo"
          },
          subject: "Perfil de empresa actualizado",
          body: `El perfil de una empresa ha sido actualizado: (baseUrl/subDomain/admin/empresas/${company.uuid}).`
        }
      ]
    ]);
  });
});
