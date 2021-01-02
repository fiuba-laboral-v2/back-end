import { nonNull, Boolean, String, Int } from "$graphql/fieldTypes";
import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { IApolloServerContext } from "$graphql/Context";
import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings/Repository";
import { SharedSettingsRepository } from "$models/SharedSettings";
import { Database } from "$config";

export const updateAdminSettings = {
  type: GraphQLAdminSettings,
  args: {
    offerDurationInDays: {
      type: nonNull(Int)
    },
    email: {
      type: nonNull(String)
    },
    emailSignature: {
      type: nonNull(String)
    },
    automaticJobApplicationApproval: {
      type: nonNull(Boolean)
    },
    companySignUpAcceptanceCriteria: {
      type: nonNull(String)
    },
    companyEditableAcceptanceCriteria: {
      type: nonNull(String)
    },
    editOfferAcceptanceCriteria: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    {
      offerDurationInDays,
      email,
      emailSignature,
      automaticJobApplicationApproval,
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    }: IUpdateAdminSettingsVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const secretarySettings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    const sharedSettings = await SharedSettingsRepository.fetch();
    secretarySettings.set({
      offerDurationInDays,
      email,
      emailSignature,
      automaticJobApplicationApproval
    });
    sharedSettings.set({
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    });
    await Database.transaction(async transaction => {
      await SecretarySettingsRepository.save(secretarySettings, transaction);
      await SharedSettingsRepository.save(sharedSettings, transaction);
    });
    return { ...secretarySettings.toJSON(), ...sharedSettings.toJSON() };
  }
};

export interface IUpdateAdminSettingsVariables {
  offerDurationInDays: number;
  email: string;
  emailSignature: string;
  automaticJobApplicationApproval: boolean;
  companySignUpAcceptanceCriteria: string;
  companyEditableAcceptanceCriteria: string;
  editOfferAcceptanceCriteria: string;
}
