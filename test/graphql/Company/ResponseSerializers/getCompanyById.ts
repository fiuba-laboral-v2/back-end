import { Company } from "../../../../src/models/Company";

const getCompanyById = async (company: Company) => (
  {
    cuit: company.cuit,
    companyName: company.companyName,
    slogan: company.slogan,
    description: company.description,
    logo: company.logo,
    website: company.website,
    email: company.email,
    phoneNumbers: await company.getPhoneNumbers(),
    photos: await company.getPhotos()
  }
);

export { getCompanyById };
