import { companyProfileType, ICompanyProfile } from "./type";
import { Int, List, nonNull, String } from "../fieldTypes";
import { CompanyProfile, CompanyProfileRepository } from "../../models/CompanyProfile";
import {
  CompanyProfilePhoneNumber,
  CompanyProfilePhoneNumberRepository
} from "../../models/CompanyProfilePhoneNumber";
import {
  CompanyProfilePhoto,
  CompanyProfilePhotoRepository
} from "../../models/CompanyProfilePhoto";

const companyProfileMutations = {
  saveCompanyProfile: {
    type: companyProfileType,
    args: {
      cuit: {
        type: nonNull(String)
      },
      companyName: {
        type: nonNull(String)
      },
      slogan: {
        type: String
      },
      description: {
        type: String
      },
      logo: {
        type: String
      },
      phoneNumbers: {
        type: List(Int)
      },
      photos: {
        type: List(String)
      }
    },
    resolve: async (_: undefined, args: ICompanyProfile) => {
      const { cuit, companyName, slogan, description, logo, phoneNumbers, photos } = args;
      const companyProfile: CompanyProfile = new CompanyProfile({
        cuit,
        companyName,
        slogan,
        description,
        logo
      });
      const companyProfilePhoneNumbers: CompanyProfilePhoneNumber[] =
        CompanyProfilePhoneNumberRepository.build(phoneNumbers);
      const companyProfilePhotos: CompanyProfilePhoto[] =
        CompanyProfilePhotoRepository.build(photos);
      await CompanyProfileRepository.save(
        companyProfile, companyProfilePhoneNumbers, companyProfilePhotos
      );
      return companyProfile.serialize();
    }
  }
};

export default companyProfileMutations;
