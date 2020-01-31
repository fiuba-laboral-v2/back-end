import { companyProfileType, ICompanyProfile } from "./type";
import { Int, List, nonNull, String } from "../fieldTypes";
import { CompanyProfile, CompanyProfileRepository } from "../../models/CompanyProfile";
import { CompanyProfilePhoneNumberRepository } from "../../models/CompanyProfilePhoneNumber";

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
        type: new List(Int)
      }
    },
    resolve: async (_: undefined, args: ICompanyProfile) => {
      const { cuit, companyName, slogan, description, logo, phoneNumbers } = args;
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
      await CompanyProfileRepository.save(companyProfile);
      return companyProfile.serialize();
    }
  }
};

export default companyProfileMutations;
