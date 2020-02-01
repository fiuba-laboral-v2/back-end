import { CompanyProfile } from "./index";
import { CompanyProfilePhoto } from "../CompanyProfilePhoto";
import { CompanyProfilePhoneNumber } from "../CompanyProfilePhoneNumber";
import Database from "../../config/Database";

export const CompanyProfileRepository = {
  save: async (
    companyProfile: CompanyProfile,
    phoneNumbers?: CompanyProfilePhoneNumber[],
    photos?: CompanyProfilePhoto[]
  ) => {
    const transaction = await Database.transaction();
    try {
      await companyProfile.save({ transaction: transaction });
      phoneNumbers = phoneNumbers || [];
      photos = photos || [];
      for (const phoneNumber of phoneNumbers) {
        phoneNumber.companyProfileId = companyProfile.id;
        await phoneNumber.save({ transaction: transaction });
      }
      for (const photo of photos) {
        photo.companyProfileId = companyProfile.id;
        await photo.save({ transaction: transaction });
      }
      companyProfile.photos = photos;
      companyProfile.phoneNumbers = phoneNumbers;
      await transaction.commit();
      return companyProfile;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
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
