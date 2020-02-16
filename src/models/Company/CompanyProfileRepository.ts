import { Company, ICompanyProfile } from "./index";
import { CompanyProfilePhoto, CompanyProfilePhotoRepository } from "../CompanyProfilePhoto";
import {
  CompanyProfilePhoneNumber,
  CompanyProfilePhoneNumberRepository
} from "../CompanyProfilePhoneNumber";
import { CompanyNotFoundError } from "./Errors/CompanyNotFoundError";
import Database from "../../config/Database";

export const CompanyProfileRepository = {
  create: async ({
    cuit,
    companyName,
    slogan,
    description,
    logo,
    website,
    email,
    phoneNumbers,
    photos
  }: ICompanyProfile) => {
    const company: Company = new Company({
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
      company, companyProfilePhoneNumbers, companyProfilePhotos
    );
  },
  save: async (
    company: Company,
    phoneNumbers: CompanyProfilePhoneNumber[] = [],
    photos: CompanyProfilePhoto[] = []
  ) => {
    const transaction = await Database.transaction();
    try {
      await company.save({ transaction: transaction });
      for (const phoneNumber of phoneNumbers) {
        phoneNumber.companyProfileId = company.id;
        await phoneNumber.save({ transaction: transaction });
      }
      for (const photo of photos) {
        photo.companyProfileId = company.id;
        await photo.save({ transaction: transaction });
      }
      company.photos = photos;
      company.phoneNumbers = phoneNumbers;
      await transaction.commit();
      return company;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  findById: async (id: number) => {
    const company: Company | null = await Company.findOne(
      { where: { id: id } }
    );
    if (!company)  throw new CompanyNotFoundError(id);
    return company;
  },
  findAll: async () => {
    return Company.findAll({});
  },
  truncate: async () => {
    return Company.destroy({ truncate: true });
  }
};
