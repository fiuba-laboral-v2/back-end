import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { UserRepository, User } from "$models/User";
import { CompanyUserRawCredentials } from "$models/User/Credentials";
import { CompanyRepository } from "$models/Company";
import { CompanyUserRepository } from "$models/CompanyUser";
import { Company, CompanyUser } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ICompanyGeneratorAttributes } from "$generators/interfaces";
import { CompanyPhotoRepository } from "$models/CompanyPhoto";

const createCompany = async (variables?: ICompanyGeneratorAttributes) => {
  const index = CompanyGenerator.getIndex();
  const { user: userAttributes, ...companyData } = withMinimumData({ index, ...variables });
  const { email, name, surname, password } = userAttributes;
  const credentials = new CompanyUserRawCredentials({ password });
  const user = new User({ name, surname, email, credentials });
  const company = new Company(companyData);
  await CompanyRepository.save(company);
  await UserRepository.save(user);
  const companyUser = new CompanyUser({
    companyUuid: company.uuid,
    userUuid: user.uuid,
    position: "position"
  });
  await CompanyUserRepository.save(companyUser);
  return company;
};

export const CompanyGenerator = {
  index: 0,
  getIndex: () => {
    CompanyGenerator.index += 1;
    return CompanyGenerator.index;
  },
  instance: {
    withMinimumData: async (variables?: ICompanyGeneratorAttributes) => createCompany(variables),
    withCompleteData: async (variables?: ICompanyGeneratorAttributes) => {
      const company = await createCompany(variables);
      await CompanyPhotoRepository.update(variables?.photos, company);
      return company;
    },
    updatedWithStatus: async (status?: ApprovalStatus) => {
      const company = await CompanyGenerator.instance.withMinimumData();
      if (!status) return company;
      company.set({ approvalStatus: status });
      await CompanyRepository.save(company);
      return company;
    }
  },
  data: {
    completeData: () => completeData({ index: CompanyGenerator.getIndex() })
  }
};
