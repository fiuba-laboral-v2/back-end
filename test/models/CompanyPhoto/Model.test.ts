import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { CompanyPhoto } from "$models";

describe("CompanyPhoto", () => {
  beforeEach(() => CompanyPhotoRepository.truncate());

  it("create a valid CompanyPhoto", async () => {
    const companyPhoto = new CompanyPhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNby
            blAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5E
            rkJggg==`,
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    expect(companyPhoto).not.toBeNull();
    expect(companyPhoto).not.toBeUndefined();
  });

  it("should throw and error if photo is null", async () => {
    const companyPhoto = new CompanyPhoto({
      photo: null,
      companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
    });
    await expect(companyPhoto.save()).rejects.toThrow();
  });

  it("should throw and error if companyUuid is null", async () => {
    const companyPhoto: CompanyPhoto = new CompanyPhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNby
            blAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5E
            rkJggg==`,
      companyUuid: null
    });
    await expect(companyPhoto.save()).rejects.toThrow();
  });
});
