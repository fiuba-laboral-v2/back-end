import { CompanyProfilePhoneNumber } from "./index";
import { CompanyProfile } from "../CompanyProfile";

export const CompanyProfilePhoneNumberRepository = {
  createPhoneNumbers: async (companyProfile: CompanyProfile, phoneNumbers: number[]) => {
    const companyProfilePhoneNumbers: CompanyProfilePhoneNumber[] = [];
    for (const phoneNumber of  phoneNumbers) {
      const companyProfilePhoneNumber: CompanyProfilePhoneNumber =
        await CompanyProfilePhoneNumberRepository.save(
          new CompanyProfilePhoneNumber({
            phoneNumber: phoneNumber,
            companyProfileId: companyProfile.id
          })
      );
      companyProfilePhoneNumbers.push(companyProfilePhoneNumber);
    }
    return companyProfilePhoneNumbers;
  },
  save: async (companyProfilePhoneNumber: CompanyProfilePhoneNumber) => {
    return companyProfilePhoneNumber.save();
  },
  truncate: async () => {
    return CompanyProfilePhoneNumber.destroy({ truncate: true });
  }
};
