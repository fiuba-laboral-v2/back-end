import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { JobApplicationRepository } from "$models/JobApplication";
import { AdminRepository, Secretary } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { CompanyNewJobApplicationEmailSender } from "$services/EmailSender";
import { EmailService } from "$services/Email";

import { CompanyGenerator } from "$generators/Company";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("CompanyNewJobApplicationEmailSender", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
  });

  it("sends an email to al company users that a new application has arrived", async () => {
    const companyAttributes = CompanyGenerator.data.completeData();
    const company = await CompanyRepository.create(companyAttributes);
    const adminAttributes = AdminGenerator.data(Secretary.graduados);
    const admin = await AdminRepository.create(adminAttributes);
    const notification = await CompanyNotificationGenerator.instance.newJobApplication({
      company,
      admin
    });
    const emailSendMock = jest.fn();
    jest.spyOn(EmailService, "send").mockImplementation(emailSendMock);
    await CompanyNewJobApplicationEmailSender.send(notification);

    const { offerUuid, applicantUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyAttributes.user.email],
          sender: {
            name: `${adminAttributes.user.name} ${adminAttributes.user.surname}`,
            email: adminAttributes.user.email
          },
          subject: "Nueva postulación a tu oferta laboral",
          body: expect.stringContaining(
            `
              Nueva postulación a tu oferta laboral: title1 (baseUrl/subDomain/empresa/ofertas/${offerUuid}) 
              Postulante: applicantName applicantSurname (baseUrl/subDomain/empresa/postulantes/${applicantUuid}).

              signature
          `.trim()
          )
        }
      ]
    ]);
  });
});
