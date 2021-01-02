import { GraphQLObjectType } from "graphql";
import { nonNull, String, Int, Boolean } from "$graphql/fieldTypes";
import { SecretarySettings, SharedSettings } from "$models";

export const GraphQLAdminSettings = new GraphQLObjectType<SecretarySettings & SharedSettings>({
  name: "AdminSettings",
  fields: () => ({
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
  })
});
