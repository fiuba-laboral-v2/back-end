import Database from "../../../src/config/Database";
import { CompanyPhoto } from "../../../src/models/CompanyPhoto";

describe("CompanyPhoto", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CompanyPhoto.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("create a valid CompanyPhoto", async () => {
    const companyPhoto: CompanyPhoto = new CompanyPhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNby
            blAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5E
            rkJggg==`,
      companyProfileId: 0
    });
    expect(companyPhoto).not.toBeNull();
    expect(companyPhoto).not.toBeUndefined();
  });

  it("raise and error if photo is null", async () => {
    const companyPhoto: CompanyPhoto = new CompanyPhoto({
      photo: null,
      companyProfileId: 0
    });
    await expect(companyPhoto.save()).rejects.toThrow();
  });

  it("raise and error if companyId is null", async () => {
    const companyPhoto: CompanyPhoto = new CompanyPhoto({
      photo: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNby
            blAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5E
            rkJggg==`,
      companyProfileId: null
    });
    await expect(companyPhoto.save()).rejects.toThrow();
  });
});
