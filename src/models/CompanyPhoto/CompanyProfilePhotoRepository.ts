import { CompanyPhoto } from "./index";

export const CompanyProfilePhotoRepository = {
  build: (photos: string[] = []) => {
    const companyProfilePhoneNumbers: CompanyPhoto[] = [];
    for (const photo of  photos) {
      companyProfilePhoneNumbers.push(new CompanyPhoto({ photo: photo }));
    }
    return companyProfilePhoneNumbers;
  },
  truncate: async () => {
    return CompanyPhoto.destroy({ truncate: true });
  }
};
