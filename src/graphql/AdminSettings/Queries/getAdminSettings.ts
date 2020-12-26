import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { IApolloServerContext } from "$src/graphql/Context";
import { AdminRepository } from "$src/models/Admin";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const getAdminSettings = {
  type: GraphQLAdminSettings,
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const secretarySettings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const sharedSettings = await SharedSettingsRepository.fetch();
    return {
      offerDurationInDays: secretarySettings.offerDurationInDays,
      email: secretarySettings.email,
      emailSignature: secretarySettings.emailSignature,
      companySignUpAcceptanceCriteria: sharedSettings.companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria: sharedSettings.companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria: sharedSettings.editOfferAcceptanceCriteria
    };
  }
};
