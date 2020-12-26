import { SharedSettings } from "$models";
import { SharedSettingsRepository } from "$models/SharedSettings";
import { UUID } from "$models/UUID";
import { SharedSettingsNotFoundError } from "$models/SharedSettings/Errors";

describe("SharedSettingsRepository", () => {
  afterAll(() => SharedSettings.truncate());

  it("saves shared settings in the database", async () => {
    const sharedSettings = new SharedSettings({
      uuid: UUID.generate(),
      companySignUpAcceptanceCriteria: "signUpCriteria",
      companyEditableAcceptanceCriteria: "editCompanyCriteria",
      editOfferAcceptanceCriteria: "editOfferCriteria"
    });
    await SharedSettingsRepository.save(sharedSettings);
    const savedSecretarySettings = await SharedSettingsRepository.find();

    expect(savedSecretarySettings).toBeObjectContaining({
      companySignUpAcceptanceCriteria: "signUpCriteria",
      companyEditableAcceptanceCriteria: "editCompanyCriteria",
      editOfferAcceptanceCriteria: "editOfferCriteria"
    });
  });

  it("throws an error if there are no settings", async () => {
    await SharedSettings.truncate();
    await expect(SharedSettingsRepository.find()).rejects.toThrowErrorWithMessage(
      SharedSettingsNotFoundError,
      "SharedSettings not present. Please check if the table was populated using the seeders"
    );
  });
});
