import Database from "../../../src/config/Database";
import {
  CompanyPhoneNumberRepository,
  CompanyPhoneNumber
} from "../../../src/models/CompanyPhoneNumber";

beforeAll(() => Database.setConnection());

beforeEach(() => CompanyPhoneNumberRepository.truncate());

afterAll(() => Database.close());

test("create a valid CompanyPhoneNumber", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: 43076555,
    companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
  });
  expect(companyPhoneNumber).not.toBeNull();
  expect(companyPhoneNumber).not.toBeUndefined();
});

test("throw and error if phoneNumber is null", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: null,
    companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da"
  });
  await expect(companyPhoneNumber.save()).rejects.toThrow();
});

test("throw and error if companyUuid is null", async () => {
  const companyPhoneNumber: CompanyPhoneNumber = new CompanyPhoneNumber({
    phoneNumber: 43076555,
    companyUuid: null
  });
  await expect(companyPhoneNumber.save()).rejects.toThrow();
});
