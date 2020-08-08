import { ICompanyTestClientAttributes } from "$generators/interfaces";
import { createApolloTestClient } from "../createApolloTestClient";
import { CompanyRepository } from "$models/Company";
import { CompanyGenerator } from "$generators/Company";

export const companyTestClient = async (
  { status, photos, expressContext, user: userAttributes }: ICompanyTestClientAttributes
) => {
  let company = await CompanyGenerator.instance.withMinimumData({
    photos,
    user: userAttributes
  });
  const [user] = await company.getUsers();
  const companyContext = { company: { uuid: company.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, companyContext);
  if (status) {
    const { admin, approvalStatus } = status;
    company = await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      company.uuid,
      approvalStatus
    );
  }
  return { apolloClient, user, company };
};
