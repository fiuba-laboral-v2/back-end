import { CompanyProfilePhoneNumber } from "../../../src/models/CompanyProfilePhoneNumber";
import Database from "../../../src/config/Database";

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyProfilePhoneNumber.destroy({ truncate: true });
});

afterAll(async () => {
  await Database.close();
});

test("create a valid CompanyProfilePhoneNumber", async () => {
  const companyProfilePhoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
    phoneNumber: 43076555,
    companyProfileId: 0
  });
  expect(companyProfilePhoneNumber).not.toBeNull();
  expect(companyProfilePhoneNumber).not.toBeUndefined();
});

test("raise and error if phoneNumber is null", async () => {
  const companyProfilePhoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
    phoneNumber: null,
    companyProfileId: 0
  });
  await expect(companyProfilePhoneNumber.save()).rejects.toThrow();
});

test("raise and error if companyProfileId is null", async () => {
  const companyProfilePhoneNumber: CompanyProfilePhoneNumber = new CompanyProfilePhoneNumber({
    phoneNumber: 43076555,
    companyProfileId: null
  });
  await expect(companyProfilePhoneNumber.save()).rejects.toThrow();
});
