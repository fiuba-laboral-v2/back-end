import { CompanyProfile } from "./index";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";

export const CompanyProfileRepository = {
  save: async (
    companyProfile: CompanyProfile,
    phoneNumbers?: CompanyProfilePhoneNumber[],
    photos?: CompanyProfilePhoto[]
  ) => {
    await companyProfile.save();
    phoneNumbers = phoneNumbers || [];
    photos = photos || [];
    for (const phoneNumber of phoneNumbers) {
      phoneNumber.companyProfileId = companyProfile.id;
      await phoneNumber.save();
    }
    for (const photo of photos) {
      photo.companyProfileId = companyProfile.id;
      await photo.save();
    }
    companyProfile.photos = photos;
    companyProfile.phoneNumbers = phoneNumbers;
    return companyProfile;
  },
  findById: async (id: number) => {
    return CompanyProfile.findOne({ where: { id: id } });
  },
  findAll: async () => {
    return CompanyProfile.findAll({});
  },
  truncate: async () => {
    return CompanyProfile.destroy({ truncate: true });
  }
};
