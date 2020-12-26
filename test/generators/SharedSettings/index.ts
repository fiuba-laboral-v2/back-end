import { SharedSettings } from "$src/models";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const SharedSettingsGenerator = {
  createDefaultSettings: () =>
    SharedSettingsRepository.save(
      new SharedSettings({
        companySignUpAcceptanceCriteria: "sign up criteria",
        companyEditableAcceptanceCriteria: "company editable criteria",
        editOfferAcceptanceCriteria: "edit offer criteria"
      })
    )
};
