import { SecretarySettings } from "$models";

export class AdminSettings {
  private secretarySettings: SecretarySettings;

  constructor(secretarySettings: SecretarySettings) {
    this.secretarySettings = secretarySettings;
  }

  get offerDurationInDays() {
    return this.secretarySettings.offerDurationInDays;
  }

  get email() {
    return this.secretarySettings.email;
  }
}
