import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLString } from "graphql/type/scalars";
import { SharedSettings } from "$models";

export const GraphQLAdminSettingsTranslations = new GraphQLObjectType<SharedSettings>({
  name: "AdminSettingsTranslations",
  fields: () => ({
    companySignUpAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    },
    companyEditableAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    },
    editOfferAcceptanceCriteria: {
      type: nonNull(GraphQLString)
    }
  })
});
