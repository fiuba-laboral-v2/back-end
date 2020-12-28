import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";
import { SecretarySettings, SharedSettings } from "$models";

export const GraphQLAdminSettings = new GraphQLObjectType<SecretarySettings & SharedSettings>({
  name: "AdminSettings",
  fields: () => ({
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
  })
});
