import { IApplicantTestClientAttributes } from "$generators/interfaces";
import { ApplicantRepository } from "$models/Applicant";
import { createApolloTestClient } from "$generators/TestClient/createApolloTestClient";
import { ApplicantGenerator } from "$generators/Applicant";

export const applicantTestClient = async (
  { status, expressContext, ...applicantAttributes }: IApplicantTestClientAttributes
) => {
  let applicant = await ApplicantGenerator.instance.withMinimumData(applicantAttributes);
  const user = await applicant.getUser();
  const applicantContext = { applicant: { uuid: applicant.uuid } };
  const apolloClient = createApolloTestClient(user, expressContext, applicantContext);
  if (status) {
    const { admin, approvalStatus } = status;
    applicant = await ApplicantRepository.updateApprovalStatus(
      admin.userUuid,
      applicant.uuid,
      approvalStatus
    );
  }
  return { apolloClient, user, applicant };
};
