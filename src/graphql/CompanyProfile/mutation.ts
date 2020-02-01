import { companyProfileType, ICompanyProfile } from "./type";
import { Int, List, nonNull, String } from "../fieldTypes";
import { CompanyProfile, CompanyProfileRepository } from "../../models/CompanyProfile";
import { CompanyProfilePhoneNumberRepository } from "../../models/CompanyProfilePhoneNumber";
import { CompanyProfilePhotoRepository } from "../../models/CompanyProfilePhoto";

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
      const companyProfile: CompanyProfile = await CompanyProfileRepository.save(
        new CompanyProfile({
          cuit,
          companyName,
          slogan,
          description,
          logo
        })
      );
      companyProfile.phoneNumbers = await CompanyProfilePhoneNumberRepository.createPhoneNumbers(
        companyProfile, phoneNumbers
      );
      companyProfile.photos = await CompanyProfilePhotoRepository.createPhotos(
        companyProfile, photos
      );
      return companyProfile.serialize();
    }
  }
};

export default companyProfileMutations;
