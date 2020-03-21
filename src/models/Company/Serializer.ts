import { Company } from "./index";

const CompanySerializer = {
  serialize: async (company: Company) => {
    return {
      id: company.id,
      cuit: company.cuit,
      companyName: company.companyName,
      slogan: company.slogan,
      description: company.description,
      logo: company.logo,
      website: company.website,
      email: company.email,
      phoneNumbers: (await company.getPhoneNumbers()).map(phoneNumber => phoneNumber.phoneNumber),
      photos: (await company.getPhotos()).map(photo => photo.photo)
    };
  }
};

export { CompanySerializer };
