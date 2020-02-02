import { CompanyProfilePhoto } from "./index";

export const CompanyProfilePhotoRepository = {
  build: (photos: string[] = []) => {
    const companyProfilePhoneNumbers: CompanyProfilePhoto[] = [];
    for (const photo of  photos) {
      companyProfilePhoneNumbers.push(new CompanyProfilePhoto({ photo: photo }));
    }
    return companyProfilePhoneNumbers;
  },
  truncate: async () => {
    return CompanyProfilePhoto.destroy({ truncate: true });
  }
};
