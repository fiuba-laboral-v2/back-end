import { Company } from "$models";
import { CompanyGenerator } from "$generators/Company";
import { CompanyRepository } from "$models/Company";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";
import { UserRepository } from "$models/User";

describe("CompanyPhotoRepository", () => {
  let company: Company;

  beforeEach(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    company = await CompanyGenerator.instance.withMinimumData();
  });

  it("creates a valid photo", async () => {
    const url = "https://i.scdn.co/image/ab67616d0000b2730f688fa11af022f0210e21cb";
    await CompanyPhotoRepository.update([url], company);
    const photos = await company.getPhotos();
    expect(photos.length).toEqual(1);
    const [photo] = photos;
    expect(photo).toBeObjectContaining({ companyUuid: company.uuid, photo: url });
  });

  it("updates company photos", async () => {
    const addedUrl = "https://i.scdn.co/image/ab67616d0000b2730f688fa11af022f0210e21cb";
    const keptUrl = "https://i.scdn.co/image/ab67616d0000b273cac78df6ec3c73e118a308e0";
    const removedUrl = "https://i.scdn.co/image/ab67616d0000b2735084c69ed3f70e8fb139e1ea";

    const oldUrls = [keptUrl, removedUrl];

    await CompanyPhotoRepository.update(oldUrls, company);

    const newUrls = [keptUrl, addedUrl];

    await CompanyPhotoRepository.update(newUrls, company);
    const photos = await company.getPhotos();
    expect(photos.length).toEqual(2);

    const [photo1, photo2] = photos;
    expect(photo1).toBeObjectContaining({ companyUuid: company.uuid, photo: keptUrl });
    expect(photo2).toBeObjectContaining({ companyUuid: company.uuid, photo: addedUrl });
  });

  it("removes duplicate urls", async () => {
    const url = "https://i.scdn.co/image/ab67616d0000b2730f688fa11af022f0210e21cb";
    await CompanyPhotoRepository.update([url, url], company);
    const photos = await company.getPhotos();
    expect(photos.length).toEqual(1);
    const [photo] = photos;
    expect(photo).toBeObjectContaining({ companyUuid: company.uuid, photo: url });
  });
});
