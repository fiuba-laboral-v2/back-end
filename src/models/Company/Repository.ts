import { Company, ICompany } from "./index";
import { CompanyPhoto, CompanyPhotoRepository } from "../CompanyPhoto";
import {
  CompanyPhoneNumber,
  CompanyPhoneNumberRepository
} from "../CompanyPhoneNumber";
import { CompanyNotFoundError } from "./Errors/CompanyNotFoundError";
import Database from "../../config/Database";

export const CompanyRepository = {
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
  }: ICompany) => {
    const company: Company = new Company({
      cuit,
      companyName,
      slogan,
      description,
      logo,
      website,
      email
    });
    const companyPhoneNumbers: CompanyPhoneNumber[] =
      CompanyPhoneNumberRepository.build(phoneNumbers);
    const companyPhotos: CompanyPhoto[] =
      CompanyPhotoRepository.build(photos);
    return CompanyRepository.save(
      company, companyPhoneNumbers, companyPhotos
    );
  },
  save: async (
    company: Company,
    phoneNumbers: CompanyPhoneNumber[] = [],
    photos: CompanyPhoto[] = []
  ) => {
    const transaction = await Database.transaction();
    try {
      await company.save({ transaction: transaction });
      for (const phoneNumber of phoneNumbers) {
        phoneNumber.companyId = company.id;
        await phoneNumber.save({ transaction: transaction });
      }
      for (const photo of photos) {
        photo.companyId = company.id;
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
    const company: Company | null = await Company.findByPk(
      id,
      { include: [ CompanyPhoneNumber, CompanyPhoto ] }
    );
    if (!company)  throw new CompanyNotFoundError(id);
    return company;
  },
  findAll: async () => {
    return Company.findAll({});
  },
  truncate: async () => {
    return Company.truncate({ cascade: true });
  }
};
