import { SecretarySettings } from "$models";
import { AdminSettings } from "$models";
import { Secretary } from "$models/Admin";

describe("AdminSettings", () => {
  it("returns SecretarySettings attributes", async () => {
    const offerDurationInDays = 12;
    const email = "boo@baa.bii";
    const settings = new AdminSettings(
      new SecretarySettings({
        secretary: Secretary.extension,
        offerDurationInDays,
        email
      })
    );
    expect(settings.offerDurationInDays).toEqual(offerDurationInDays);
    expect(settings.email).toEqual(email);
  });
});
