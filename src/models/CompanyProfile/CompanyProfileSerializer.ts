import { CompanyProfile } from "./index";

const CompanyProfileSerializer = {
  serialize: (companyProfile: CompanyProfile) => {
    return {
      id: companyProfile.id,
      cuit: companyProfile.cuit,
      companyName: companyProfile.companyName,
      slogan: companyProfile.slogan,
      description: companyProfile.description,
      logo: companyProfile.logo,
      phoneNumbers: companyProfile.phoneNumbers?.map(phoneNumber => phoneNumber.phoneNumber),
      photos: companyProfile.photos?.map(photo => photo.photo)
    };
  }
};

export { CompanyProfileSerializer };
