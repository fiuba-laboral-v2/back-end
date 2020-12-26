import { gql } from "apollo-server";
import { SharedSettings } from "$models";
import { SharedSettingsRepository } from "$models/SharedSettings";
import { UUID } from "$models/UUID";
import { client } from "$test/graphql/ApolloTestClient";

const GET_ADMIN_SETTINGS_TRANSLATIONS = gql`
  query {
    getAdminSettingsTranslations {
      companySignUpAcceptanceCriteria
      companyEditableAcceptanceCriteria
      editOfferAcceptanceCriteria
    }
  }
`;

describe("getAdminSettingsTranslations", () => {
  const companySignUpAcceptanceCriteria = "sign up acceptance criteria";
  const companyEditableAcceptanceCriteria = "company editable acceptance criteria";
  const editOfferAcceptanceCriteria = "edit offer acceptance criteria";

  beforeAll(async () => {
    await SharedSettingsRepository.save(
      new SharedSettings({
        uuid: UUID.generate(),
        companySignUpAcceptanceCriteria,
        companyEditableAcceptanceCriteria,
        editOfferAcceptanceCriteria
      })
    );
  });
  afterAll(() => SharedSettings.truncate());

  it("gets admin settings for all permissions", async () => {
    const { data, errors } = await client
      .loggedOut()
      .query({ query: GET_ADMIN_SETTINGS_TRANSLATIONS });
    expect(errors).toBeUndefined();
    expect(data!.getAdminSettingsTranslations).toEqual({
      companySignUpAcceptanceCriteria,
      companyEditableAcceptanceCriteria,
      editOfferAcceptanceCriteria
    });
  });
});
