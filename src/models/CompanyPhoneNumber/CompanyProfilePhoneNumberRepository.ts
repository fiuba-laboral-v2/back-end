import { CompanyPhoneNumber } from "./index";

export const CompanyProfilePhoneNumberRepository = {
  build: (phoneNumbers: number[] = []) => {
    const companyPhoneNumbers: CompanyPhoneNumber[] = [];
    for (const phoneNumber of  phoneNumbers) {
      companyPhoneNumbers.push(new CompanyPhoneNumber({ phoneNumber: phoneNumber }));
    }
    return companyPhoneNumbers;
  },
  truncate: async () => {
    return CompanyPhoneNumber.destroy({ truncate: true });
  }
};
