import { IApplicantAttributes } from "$generators/interfaces";
import { ApplicantRepository } from "$models/Applicant";
import { withCompleteData } from "$generators/TestClient/Applicant/withCompleteData";
import { createApolloTestClient } from "$generators/TestClient/createApolloTestClient";

export const applicantTestClient = async (
  index: number,
  { status, expressContext, ...applicantAttributes }: IApplicantAttributes
) => {
  let applicant = await ApplicantRepository.create(withCompleteData({
    index,
    ...applicantAttributes
  }));
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
