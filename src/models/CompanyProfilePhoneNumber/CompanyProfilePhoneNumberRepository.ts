import { CompanyProfilePhoneNumber } from "./index";

export const CompanyProfilePhoneNumberRepository = {
  build: (phoneNumbers: number[]) => {
    const companyProfilePhoneNumbers: CompanyProfilePhoneNumber[] = [];
    for (const phoneNumber of  phoneNumbers) {
      companyProfilePhoneNumbers.push(new CompanyProfilePhoneNumber({ phoneNumber: phoneNumber }));
    }
    return companyProfilePhoneNumbers;
  },
  truncate: async () => {
    return CompanyProfilePhoneNumber.destroy({ truncate: true });
  }
};
