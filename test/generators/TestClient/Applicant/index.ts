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
  const user = await applicant.getUser();
  const applicantContext = { applicant: { uuid: applicant.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, applicantContext);
  if (status) {
    const { approvalStatus } = status;
    applicant.set({ approvalStatus });
    await ApplicantRepository.save(applicant);
  }
  return { apolloClient, user, applicant };
};
