import Database from "../../../src/config/Database";
import { CompanyPhoneNumber } from "../../../src/models/CompanyPhoneNumber";

beforeAll(async () => {
  await Database.setConnection();
});

beforeEach(async () => {
  await CompanyPhoneNumber.destroy({ truncate: true });
});

afterAll(async () => {
  await Database.close();
});

test("create a valid CompanyPhoneNumber", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: 43076555,
    companyId: 0
  });
  expect(companyPhoneNumber).not.toBeNull();
  expect(companyPhoneNumber).not.toBeUndefined();
});

test("raise and error if phoneNumber is null", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: null,
    companyId: 0
  });
  await expect(companyPhoneNumber.save()).rejects.toThrow();
});

test("raise and error if companyId is null", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: 43076555,
    companyId: null
  });
  await expect(companyPhoneNumber.save()).rejects.toThrow();
});
