import { CompanyProfilePhoto } from "./index";
import { CompanyProfile } from "../CompanyProfile";

export const CompanyProfilePhotoRepository = {
  createPhotos: async (companyProfile: CompanyProfile, photos: string[]) => {
    const companyProfilePhoneNumbers: CompanyProfilePhoto[] = [];
    for (const photo of  photos) {
      const companyProfilePhoto: CompanyProfilePhoto =
        await CompanyProfilePhotoRepository.save(
          new CompanyProfilePhoto({
            photo: photo,
            companyProfileId: companyProfile.id
          })
        );
      companyProfilePhoneNumbers.push(companyProfilePhoto);
    }
    return companyProfilePhoneNumbers;
  },
  save: async (companyProfilePhoto: CompanyProfilePhoto) => {
    return companyProfilePhoto.save();
  },
  truncate: async () => {
    return CompanyProfilePhoto.destroy({ truncate: true });
  }
};
