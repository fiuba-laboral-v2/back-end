import { ValidationError } from "sequelize";
import { SharedSettings } from "$models";

describe("SharedSettings", () => {
  it("creates valid settings", async () => {
    const sharedSettingsAttributes = {
      companySignUpAcceptanceCriteria: "signUp",
      companyEditableAcceptanceCriteria: "editCompany",
      editOfferAcceptanceCriteria: "editOffer"
    };
    const secretarySettings = new SharedSettings(sharedSettingsAttributes);
    await expect(secretarySettings.validate()).resolves.not.toThrow();
    expect(secretarySettings).toBeObjectContaining(sharedSettingsAttributes);
  });

  it("throws an error if no companySignUpAcceptanceCriteria is provided", async () => {
    const secretarySettings = new SharedSettings({
      companyEditableAcceptanceCriteria: "editCompany",
      editOfferAcceptanceCriteria: "editOffer"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SharedSettings.companySignUpAcceptanceCriteria cannot be null"
    );
  });

  it("throws an error if no companyEditableAcceptanceCriteria is provided", async () => {
    const secretarySettings = new SharedSettings({
      companySignUpAcceptanceCriteria: "signUp",
      editOfferAcceptanceCriteria: "editOffer"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SharedSettings.companyEditableAcceptanceCriteria cannot be null"
    );
  });

  it("throws an error if no editOfferAcceptanceCriteria is provided", async () => {
    const secretarySettings = new SharedSettings({
      companySignUpAcceptanceCriteria: "signUp",
      companyEditableAcceptanceCriteria: "editCompany"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SharedSettings.editOfferAcceptanceCriteria cannot be null"
    );
  });
});
