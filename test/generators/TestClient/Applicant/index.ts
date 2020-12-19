import { UserRepository } from "$models/User";
import { IApplicantTestClientAttributes } from "$generators/interfaces";
import { ApplicantRepository } from "$models/Applicant";
import { createApolloTestClient } from "$generators/TestClient/createApolloTestClient";
import { ApplicantGenerator } from "$generators/Applicant";

export const applicantTestClient = async ({
  status,
  expressContext,
  ...applicantAttributes
}: IApplicantTestClientAttributes) => {
  const applicant = await ApplicantGenerator.instance.withMinimumData(applicantAttributes);
  const user = await UserRepository.findByUuid(applicant.userUuid);
  const applicantContext = { applicant: { uuid: applicant.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, applicantContext);
  if (status) {
    applicant.set({ approvalStatus: status });
    await ApplicantRepository.save(applicant);
  }
  return { apolloClient, user, applicant };
};
