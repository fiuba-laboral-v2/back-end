import { Company } from "$models";
import { Secretary } from "$models/Admin";
import { UpdatedCompanyProfileNotificationFactory } from "$models/Notification";
import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { UUID } from "$models/UUID";
import { CuitGenerator } from "$generators/Cuit";

describe("UpdatedCompanyProfileNotificationFactory", () => {
  const factory = UpdatedCompanyProfileNotificationFactory;
  let company: Company;

  beforeAll(() => {
    company = new Company({
      uuid: UUID.generate(),
      cuit: CuitGenerator.generate(),
      companyName: "companyName",
      businessName: "businessName"
    });
  });

  it("returns an array with two UpdatedCompanyProfileAdminNotification", async () => {
    const notifications = factory.create(company);
    const [extensionNotification, graduadosNotification] = notifications;

    expect(notifications).toHaveLength(2);
    expect(extensionNotification).toBeInstanceOf(UpdatedCompanyProfileAdminNotification);
    expect(graduadosNotification).toBeInstanceOf(UpdatedCompanyProfileAdminNotification);
  });

  it("returns an array with a the correct attributes", async () => {
    const notifications = factory.create(company);

    expect(notifications).toEqual([
      {
        uuid: undefined,
        companyUuid: company.uuid,
        secretary: Secretary.extension,
        isNew: true,
        createdAt: undefined
      },
      {
        uuid: undefined,
        companyUuid: company.uuid,
        secretary: Secretary.graduados,
        isNew: true,
        createdAt: undefined
      }
    ]);
  });
});
