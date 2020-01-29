import { CompanyProfile } from "../../../src/models/CompanyProfile";

const CompanyProfileMock = () => {
  return new CompanyProfile({
    cuit: "30-71181901-7",
    companyName: "devartis",
    slogan: "We craft web applications for great businesses",
    description: "some description",
    logo: "https://pbs.twimg.com/profile_images/1039514458282844161/apKQh1fu_400x400.jpg"
  });
};

export { CompanyProfileMock };
