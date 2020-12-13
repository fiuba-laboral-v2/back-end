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
import { AdminRepository, Secretary } from "$models/Admin";

import { ApplicantGenerator } from "$generators/Applicant";
import { AdminGenerator } from "$generators/Admin";

describe("ApprovedProfileApplicantNotificationEmailSender", () => {
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
            name: `${adminAttributes.user.name} ${adminAttributes.user.surname}`,
            email: adminAttributes.user.email
          },
          subject: "Perfil aprobado",
          body:
            "Tu perfil ha sido aprobado: (baseUrl/subDomain/postulante/perfil)." +
            "\n\n" +
            "Bolsa de Trabajo FIUBA"
        }
      ]
    ]);
  });
});
