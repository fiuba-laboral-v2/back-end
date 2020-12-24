import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { EmailService } from "$services/Email";
import { PasswordRecoveryEmailSender } from "$services/EmailSender";
import jsonWebToken from "jsonwebtoken";

import { CompanyGenerator } from "$generators/Company";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

describe("PasswordRecoveryEmailSender", () => {
  const emailSendMock = jest.fn();
  const token = "token";

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

  it("sends an email to a companyUser to recover the password", async () => {
    jest.spyOn(jsonWebToken, "sign").mockImplementation(() => token);
    const company = await CompanyGenerator.instance.withMinimumData();
    const [companyUser] = await UserRepository.findByCompanyUuid(company.uuid);
    await PasswordRecoveryEmailSender.send(companyUser);

    expect(emailSendMock.mock.calls).toEqual([
      [
        {
          receiverEmails: [companyUser.email],
          sender: {
            email: "no-reply@fi.uba.ar",
            name: "[No responder] Bolsa de Trabajo FIUBA"
          },
          subject: "Recuperación de contraseña",
          body:
            "Usted ha solicitado la recuperación de su contraseña." +
            "\n" +
            "Haga click en el siguiente link para realizar el cambio." +
            "\n" +
            `baseUrl/subDomain/empresa/contrasena/recuperar/?token=${token}`
        }
      ]
    ]);
  });
});
