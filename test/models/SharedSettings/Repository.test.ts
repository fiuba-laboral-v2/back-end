import { SharedSettings } from "$models";
import { SharedSettingsRepository } from "$models/SharedSettings";
import { SharedSettingsNotFoundError } from "$models/SharedSettings/Errors";
import { SharedSettingsGenerator } from "$generators/SharedSettings";

describe("SharedSettingsRepository", () => {
  it("saves shared settings in the database", async () => {
    SharedSettingsRepository.truncate();
    const sharedSettings = new SharedSettings({
      companySignUpAcceptanceCriteria: "signUpCriteria",
      companyEditableAcceptanceCriteria: "editCompanyCriteria",
      editOfferAcceptanceCriteria: "editOfferCriteria"
    });
    await SharedSettingsRepository.save(sharedSettings);
    const savedSecretarySettings = await SharedSettingsRepository.fetch();

    expect(savedSecretarySettings).toBeObjectContaining({
      companySignUpAcceptanceCriteria: "signUpCriteria",
      companyEditableAcceptanceCriteria: "editCompanyCriteria",
      editOfferAcceptanceCriteria: "editOfferCriteria"
    });
  });

  it("throws an error if there are no settings", async () => {
    await SharedSettingsRepository.truncate();
    await expect(SharedSettingsRepository.fetch()).rejects.toThrowErrorWithMessage(
      SharedSettingsNotFoundError,
      "SharedSettings not present. Please check if the table was populated using the seeders"
    );
    await SharedSettingsGenerator.createDefaultSettings();
  });
});
