import { UserInputError } from "apollo-server";
import { CompanyProfile, ICompanyProfile } from "./index";
import { CompanyProfilePhoto, CompanyProfilePhotoRepository } from "../CompanyProfilePhoto";
import {
  CompanyProfilePhoneNumber,
  CompanyProfilePhoneNumberRepository
} from "../CompanyProfilePhoneNumber";
import Database from "../../config/Database";

export const CompanyProfileRepository = {
  create: async (values: ICompanyProfile) => {
    const {
      cuit,
      companyName,
      slogan,
      description,
      logo,
      website,
      email,
      phoneNumbers,
      photos
    } = values;
    const companyProfile: CompanyProfile = new CompanyProfile({
      cuit,
      companyName,
      slogan,
      description,
      logo,
      website,
      email
    });
    const companyProfilePhoneNumbers: CompanyProfilePhoneNumber[] =
      CompanyProfilePhoneNumberRepository.build(phoneNumbers);
    const companyProfilePhotos: CompanyProfilePhoto[] =
      CompanyProfilePhotoRepository.build(photos);
    return CompanyProfileRepository.save(
      companyProfile, companyProfilePhoneNumbers, companyProfilePhotos
    );
  },
  save: async (
    companyProfile: CompanyProfile,
    phoneNumbers: CompanyProfilePhoneNumber[] = [],
    photos: CompanyProfilePhoto[] = []
  ) => {
    const transaction = await Database.transaction();
    try {
      await companyProfile.save({ transaction: transaction });
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
    const companyProfile: CompanyProfile | null = await CompanyProfile.findOne(
      { where: { id: id } }
    );
    if (!companyProfile)  throw new UserInputError("Company Not found", { invalidArgs: id });
    return companyProfile;
  },
  findAll: async () => {
    return CompanyProfile.findAll({});
  },
  truncate: async () => {
    return CompanyProfile.destroy({ truncate: true });
  }
};
