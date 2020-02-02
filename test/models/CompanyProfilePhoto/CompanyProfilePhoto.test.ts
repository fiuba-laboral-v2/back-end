import Database from "../../../src/config/Database";
import { CompanyProfilePhoto } from "../../../src/models/CompanyProfilePhoto";

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyProfilePhoto.destroy({ truncate: true });
});

afterAll(async () => {
  await Database.close();
});

test("create a valid CompanyProfilePhoto", async () => {
  const companyProfilePhoto: CompanyProfilePhoto = new CompanyProfilePhoto({
    photo: "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQV" +
      "QI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    companyProfileId: 0
  });
  expect(companyProfilePhoto).not.toBeNull();
  expect(companyProfilePhoto).not.toBeUndefined();
});

test("raise and error if photo is null", async () => {
  const companyProfilePhoto: CompanyProfilePhoto = new CompanyProfilePhoto({
    photo: null,
    companyProfileId: 0
  });
  await expect(companyProfilePhoto.save()).rejects.toThrow();
});

test("raise and error if companyProfileId is null", async () => {
  const companyProfilePhoto: CompanyProfilePhoto = new CompanyProfilePhoto({
    photo: "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQV" +
      "QI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    companyProfileId: null
  });
  await expect(companyProfilePhoto.save()).rejects.toThrow();
});
