import faker from "faker";

const companyMockData = {
  cuit: faker.random.arrayElement([ "30711819017", "30701307115", "30703088534" ]),
  companyName: faker.company.companyName(),
  slogan: faker.company.catchPhrase(),
  description: faker.lorem.sentence(),
  logo: faker.image.dataUri(),
  website: faker.internet.url(),
  email: faker.internet.email()
};

const photos = [
  faker.image.dataUri(),
  faker.image.dataUri()
];

const phoneNumbers = [
  parseInt(faker.phone.phoneNumber("0165#######"), 10),
  parseInt(faker.phone.phoneNumber("0165#######"), 10),
  parseInt(faker.phone.phoneNumber("0165#######"), 10),
  parseInt(faker.phone.phoneNumber("0165#######"), 10)
];

export { companyMockData, phoneNumbers, photos };
