import { ID, nonNull } from "$graphql/fieldTypes";
import { ApplicantRepository } from "$models/Applicant";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApprovalStatus } from "$graphql/ApprovalStatus/Types/GraphQLApprovalStatus";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { IApolloServerContext } from "$graphql/Context";
import { ApplicantApprovalEvent } from "$models";
import { ApplicantApprovalEventRepository } from "$models/Applicant/ApplicantApprovalEvent";
import { Database } from "$config";

export const updateApplicantApprovalStatus = {
  type: GraphQLApplicant,
  args: {
    uuid: {
      type: nonNull(ID)
    },
    approvalStatus: {
      type: nonNull(GraphQLApprovalStatus)
    }
  },
  resolve: async (
    _: undefined,
    { uuid: applicantUuid, approvalStatus: status }: IUpdateApplicantApprovalStatusArguments,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    applicant.set({ approvalStatus: status });
    const event = new ApplicantApprovalEvent({ adminUserUuid, applicantUuid, status });

    return Database.transaction(async transaction => {
      await ApplicantRepository.save(applicant, transaction);
      await ApplicantApprovalEventRepository.save(event, transaction);
      return applicant;
    });
  }
};

interface IUpdateApplicantApprovalStatusArguments {
  uuid: string;
  approvalStatus: ApprovalStatus;
}
