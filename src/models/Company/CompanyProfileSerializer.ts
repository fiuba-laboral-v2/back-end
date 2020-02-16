import { Company } from "./index";

const CompanyProfileSerializer = {
  serialize: (company: Company) => {
    return {
      id: company.id,
      cuit: company.cuit,
      companyName: company.companyName,
      slogan: company.slogan,
      description: company.description,
      logo: company.logo,
      website: company.website,
      email: company.email,
      phoneNumbers: company.phoneNumbers?.map(phoneNumber => phoneNumber.phoneNumber) || [],
      photos: company.photos?.map(photo => photo.photo) || []
    };
  }
};

export { CompanyProfileSerializer };
