import {
  ApplicantNotificationRepository,
  ApprovedProfileApplicantNotification
} from "$models/ApplicantNotification";
import { EmailService } from "$services/Email";
import { ApprovedProfileApplicantNotificationEmailSender } from "$services/EmailSender";

import { UserRepository } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("ApprovedProfileApplicantNotificationEmailSender", () => {
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

  it("sends an email to an applicant user that a the profile its been approved", async () => {
    const admin = await AdminGenerator.graduados();
    const adminUser = await UserRepository.findByUuid(admin.userUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const applicantAttributes = ApplicantGenerator.data.minimum();
    const applicant = await ApplicantRepository.create(applicantAttributes);
    const notification = new ApprovedProfileApplicantNotification({
      moderatorUuid: admin.userUuid,
      notifiedApplicantUuid: applicant.uuid
    });
    await ApplicantNotificationRepository.save(notification);

    await ApprovedProfileApplicantNotificationEmailSender.send(notification);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [applicantAttributes.user.email],
          sender: {
            name: `${adminUser.name} ${adminUser.surname}`,
            email: settings.email
          },
          subject: "Perfil aprobado",
          body:
            "Tu perfil ha sido aprobado: (baseUrl/subDomain/postulante/perfil)." +
            "\n\n" +
            "Bolsa de Trabajo FIUBA."
        }
      ]
    ]);
  });
});
