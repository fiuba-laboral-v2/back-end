import { nonNull } from "$graphql/fieldTypes";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";
import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings/Repository";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const updateAdminSettings = {
  type: GraphQLAdminSettings,
  args: {
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    },
    email: {
      type: nonNull(GraphQLString)
    },
    emailSignature: {
      type: nonNull(GraphQLString)
    },
    companySignUpAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    },
    companyEditableAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    },
    editOfferAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    }
  },
  resolve: async (
    _: undefined,
    {
      offerDurationInDays,
      email,
      emailSignature,
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    }: IUpdateAdminSettingsVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const secretarySettings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    secretarySettings.set({ offerDurationInDays, email, emailSignature });
    SecretarySettingsRepository.save(secretarySettings);
    const sharedSettings = await SharedSettingsRepository.find();
    sharedSettings.set({
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    });
    SharedSettingsRepository.save(sharedSettings);
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

interface IUpdateAdminSettingsVariables {
  offerDurationInDays: number;
  email: string;
  emailSignature: string;
  companySignUpAcceptanceCriteria: string;
  companyEditableAcceptanceCriteria: string;
  editOfferAcceptanceCriteria: string;
}
