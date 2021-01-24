import { ICompanyTestClientAttributes } from "$generators/interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { CompanyGenerator } from "$generators/Company";

export const companyTestClient = async ({
  status,
  photos,
  expressContext,
  hasAnInternshipAgreement,
  user: userAttributes
}: ICompanyTestClientAttributes) => {
  const company = await CompanyGenerator.instance.withMinimumData({
    photos,
    user: userAttributes,
    hasAnInternshipAgreement
  });
  const [user] = await UserRepository.findByCompanyUuid(company.uuid);
  const companyContext = { company: { uuid: company.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, companyContext);
  if (status) {
    company.set({ approvalStatus: status });
    await CompanyRepository.save(company);
  }
  return { apolloClient, user, company };
};
