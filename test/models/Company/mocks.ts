import faker from "faker";
import { UserMocks } from "../User/mocks";

export const companyMockDataWithoutUser = {
  cuit: faker.random.arrayElement(["30711819017", "30701307115", "30703088534"]),
  companyName: faker.name.firstName(),
  slogan: faker.company.catchPhrase(),
  description: faker.lorem.sentence(),
  logo: faker.image.dataUri(),
  website: faker.internet.url(),
  email: faker.internet.email()
};

export const companyMockData = {
  user: UserMocks.userAttributes,
  ...companyMockDataWithoutUser
};

export const photos = [
  faker.image.dataUri(),
  faker.image.dataUri()
];

export const phoneNumbers = [
  faker.phone.phoneNumber("0165#######"),
  faker.phone.phoneNumber("0165#######"),
  faker.phone.phoneNumber("0165#######"),
  faker.phone.phoneNumber("0165#######")
];
