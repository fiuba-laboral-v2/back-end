import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferRepository } from "$models/Offer";
import { ApplicantType } from "$models/Applicant";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Career, Offer } from "$models";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { UnauthorizedError } from "$graphql/Errors";

import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import moment from "moment";

const GET_APPROVED_OFFERS = gql`
  query($updatedBeforeThan: PaginatedInput, $careerCodes: [ID!]) {
    getApprovedOffers(updatedBeforeThan: $updatedBeforeThan, careerCodes: $careerCodes) {
      results {
        uuid
      }
      shouldFetchMore
    }
  }
`;

describe("getApprovedOffers", () => {
  let firstCareer: Career;
  let secondCareer: Career;
  let offerApprovedForStudentsByExtension: Offer;
  let offerApprovedForGraduadosByGraduados: Offer;
  let offerForBothAndApprovedByExtension: Offer;
  let offerForBothAndApprovedByGraduados: Offer;
  let offerForBothAndApprovedByGraduadosAndExtension: Offer;
  let expiredOfferForBothAndApprovedByGraduadosAndExtension: Offer;

  const approvedApplicantTestClient = async (careers: IApplicantCareer[]) => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await AdminGenerator.extension()
      },
      careers
    });
    return apolloClient;
  };

  const createOfferWith = async (
    status: ApprovalStatus,
    secretary: Secretary,
    targetApplicantType: ApplicantType,
    careers?: IOfferCareer[]
  ) => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    return OfferGenerator.instance.updatedWithStatus({
      companyUuid,
      careers: careers || [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }],
      admin: await AdminGenerator.instance({ secretary }),
      status,
      targetApplicantType
    });
  };

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    await SecretarySettingsRepository.truncate();

    await SecretarySettingsGenerator.createDefaultSettings();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();

    offerApprovedForStudentsByExtension = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.extension,
      ApplicantType.student
    );
    await createOfferWith(ApprovalStatus.rejected, Secretary.extension, ApplicantType.student);
    offerApprovedForGraduadosByGraduados = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.graduate
    );
    await createOfferWith(ApprovalStatus.rejected, Secretary.graduados, ApplicantType.graduate);
    offerForBothAndApprovedByExtension = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.extension,
      ApplicantType.both
    );
    offerForBothAndApprovedByGraduados = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.both
    );
    offerForBothAndApprovedByGraduadosAndExtension = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.both
    );
    const adminExtension = await AdminGenerator.extension();
    const { offerDurationInDays } = await SecretarySettingsRepository.findBySecretary(
      adminExtension.secretary
    );
    offerForBothAndApprovedByGraduadosAndExtension.updateStatus(
      adminExtension,
      ApprovalStatus.approved
    );
    offerForBothAndApprovedByGraduadosAndExtension.updateExpirationDate(
      adminExtension,
      offerDurationInDays
    );
    await OfferRepository.save(offerForBothAndApprovedByGraduadosAndExtension);
    await createOfferWith(ApprovalStatus.rejected, Secretary.graduados, ApplicantType.both);
    const { uuid } = await createOfferWith(
      ApprovalStatus.rejected,
      Secretary.graduados,
      ApplicantType.both
    );
    [, [expiredOfferForBothAndApprovedByGraduadosAndExtension]] = await Offer.update(
      { graduatesExpirationDateTime: moment().subtract(1, "days").endOf("day") },
      {
        where: { uuid },
        returning: true
      }
    );
  });

  describe("when the applicant is only a student", () => {
    let studentApolloClient: ApolloServerTestClient;

    beforeAll(async () => {
      studentApolloClient = await approvedApplicantTestClient([
        {
          careerCode: firstCareer.code,
          currentCareerYear: 4,
          approvedSubjectCount: 40,
          isGraduate: false
        },
        {
          careerCode: secondCareer.code,
          currentCareerYear: 4,
          approvedSubjectCount: 40,
          isGraduate: false
        }
      ]);
    });

    it("returns only the approved offers targeted for students", async () => {
      mockItemsPerPage(10);
      const { data, errors } = await studentApolloClient.query({ query: GET_APPROVED_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getApprovedOffers.results).toEqual([
        { uuid: offerForBothAndApprovedByGraduadosAndExtension.uuid },
        { uuid: offerForBothAndApprovedByExtension.uuid },
        { uuid: offerApprovedForStudentsByExtension.uuid }
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });
  });

  describe("when the applicant is only a graduate", () => {
    let graduateApolloClient: ApolloServerTestClient;

    beforeAll(async () => {
      graduateApolloClient = await approvedApplicantTestClient([
        {
          careerCode: firstCareer.code,
          isGraduate: true
        },
        {
          careerCode: secondCareer.code,
          isGraduate: true
        }
      ]);
    });

    it("returns only the approved offers targeted for graduates", async () => {
      mockItemsPerPage(10);
      const { data, errors } = await graduateApolloClient.query({ query: GET_APPROVED_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getApprovedOffers.results).toEqual([
        { uuid: offerForBothAndApprovedByGraduadosAndExtension.uuid },
        { uuid: offerForBothAndApprovedByGraduados.uuid },
        { uuid: offerApprovedForGraduadosByGraduados.uuid }
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });
  });

  describe("when the applicant is a graduate for one career an a student in another one", () => {
    let graduateAndStudentApolloClient: ApolloServerTestClient;

    beforeAll(async () => {
      graduateAndStudentApolloClient = await approvedApplicantTestClient([
        {
          careerCode: firstCareer.code,
          isGraduate: true
        },
        {
          careerCode: secondCareer.code,
          currentCareerYear: 4,
          approvedSubjectCount: 40,
          isGraduate: false
        }
      ]);
    });

    it("returns only the approved offers targeted for graduates and students", async () => {
      mockItemsPerPage(10);
      const { data, errors } = await graduateAndStudentApolloClient.query({
        query: GET_APPROVED_OFFERS
      });

      expect(errors).toBeUndefined();
      expect(data!.getApprovedOffers.results).toEqual([
        { uuid: offerForBothAndApprovedByGraduadosAndExtension.uuid },
        { uuid: offerForBothAndApprovedByGraduados.uuid },
        { uuid: offerForBothAndApprovedByExtension.uuid },
        { uuid: offerApprovedForGraduadosByGraduados.uuid },
        { uuid: offerApprovedForStudentsByExtension.uuid }
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });

    it("won't return an expired offer", async () => {
      mockItemsPerPage(10);
      const { data, errors } = await graduateAndStudentApolloClient.query({
        query: GET_APPROVED_OFFERS
      });

      const { uuid } = expiredOfferForBothAndApprovedByGraduadosAndExtension;

      expect(errors).toBeUndefined();
      expect(data!.getApprovedOffers.results.map(offer => offer.uuid).includes(uuid)).toBe(false);
    });
  });

  describe("pagination", () => {
    let newOffersByDescUpdatedAt: Offer[] = [];
    let apolloClient: ApolloServerTestClient;

    beforeAll(async () => {
      await CompanyRepository.truncate();
      await UserRepository.truncate();

      apolloClient = await approvedApplicantTestClient([
        {
          careerCode: firstCareer.code,
          isGraduate: true
        },
        {
          careerCode: secondCareer.code,
          currentCareerYear: 4,
          approvedSubjectCount: 40,
          isGraduate: false
        }
      ]);

      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();

      for (const _ of range(15)) {
        newOffersByDescUpdatedAt.push(
          await OfferGenerator.instance.updatedWithStatus({
            companyUuid,
            status: ApprovalStatus.approved,
            admin: await AdminGenerator.extension(),
            targetApplicantType: ApplicantType.both
          })
        );
      }
      newOffersByDescUpdatedAt = newOffersByDescUpdatedAt.sort(offer => -offer.updatedAt);
    });

    it("gets the latest 10 offers", async () => {
      const itemsPerPage = 10;
      mockItemsPerPage(itemsPerPage);
      const { data } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
      expect(data!.getApprovedOffers.results.map(offer => offer.uuid)).toEqual([
        ...newOffersByDescUpdatedAt.slice(0, itemsPerPage).map(offer => offer.uuid)
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(true);
    });

    it("gets the next 3 offers", async () => {
      const itemsPerPage = 3;
      const lastOfferIndex = 9;
      mockItemsPerPage(itemsPerPage);
      const lastOffer = newOffersByDescUpdatedAt[lastOfferIndex];
      const { data } = await apolloClient.query({
        query: GET_APPROVED_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: lastOffer.updatedAt.toISOString(),
            uuid: lastOffer.uuid
          }
        }
      });
      expect(data!.getApprovedOffers.results.map(offer => offer.uuid)).toEqual(
        newOffersByDescUpdatedAt
          .slice(lastOfferIndex + 1, lastOfferIndex + 1 + itemsPerPage)
          .map(offer => offer.uuid)
      );
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(true);
    });
  });

  describe("pagination (student only)", () => {
    let studentOffer: Offer;
    let apolloClient: ApolloServerTestClient;

    beforeAll(async () => {
      await CompanyRepository.truncate();
      await UserRepository.truncate();

      apolloClient = await approvedApplicantTestClient([
        {
          careerCode: secondCareer.code,
          currentCareerYear: 4,
          approvedSubjectCount: 40,
          isGraduate: false
        }
      ]);

      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      await OfferGenerator.instance.forGraduates({ companyUuid });
      studentOffer = await OfferGenerator.instance.forStudents({ companyUuid });
    });

    it("does not retrieve graduate offer in second page", async () => {
      mockItemsPerPage(1);
      const { data } = await apolloClient.query({
        query: GET_APPROVED_OFFERS,
        variables: {
          updatedBeforeThan: {
            dateTime: studentOffer.updatedAt.toISOString(),
            uuid: studentOffer.uuid
          }
        }
      });
      expect(data!.getApprovedOffers.results.length).toEqual(0);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
    });
  });

  it("filters offers by career code", async () => {
    const { code: careerCode1 } = await CareerGenerator.instance();
    const { code: careerCode2 } = await CareerGenerator.instance();
    const { uuid: offerUuid } = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.both,
      [{ careerCode: careerCode1 }]
    );
    await createOfferWith(ApprovalStatus.approved, Secretary.graduados, ApplicantType.both, [
      { careerCode: careerCode2 }
    ]);
    const apolloClient = await approvedApplicantTestClient([
      {
        careerCode: firstCareer.code,
        isGraduate: true
      },
      {
        careerCode: secondCareer.code,
        currentCareerYear: 4,
        approvedSubjectCount: 40,
        isGraduate: false
      }
    ]);
    const { data } = await apolloClient.query({
      query: GET_APPROVED_OFFERS,
      variables: {
        careerCodes: [careerCode1]
      }
    });
    expect(data!.getApprovedOffers.results.map(result => result.uuid)).toEqual([offerUuid]);
    expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
  });

  it("returns no offers when no offers were created", async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    const apolloClient = await approvedApplicantTestClient([
      { careerCode: firstCareer.code, isGraduate: true }
    ]);
    const { data, errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });

    expect(errors).toBeUndefined();
    expect(data!.getApprovedOffers.results).toHaveLength(0);
    expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
  });

  it("returns an error when the user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await AdminGenerator.extension()
      }
    });
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
