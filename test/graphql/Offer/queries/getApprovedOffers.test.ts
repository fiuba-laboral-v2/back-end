import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApplicantType, OfferRepository } from "$models/Offer";
import { Secretary } from "$models/Admin";
import { Career, Offer } from "$models";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";
import { UnauthorizedError } from "$graphql/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { AdminGenerator } from "$generators/Admin";
import { range } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { IOfferCareer } from "$models/Offer/OfferCareer";

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
  let approvedStudentsOffer: Offer;
  let approvedGraduadosOffer: Offer;
  let approvedByExtensionBothOffer: Offer;
  let approvedByGraduadosBothOffer: Offer;
  let approvedByGraduadosAndExtensionBothOffer: Offer;

  const approvedApplicantTestClient = async (careers: IApplicantCareer[]) => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension })
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

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();

    approvedStudentsOffer = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.extension,
      ApplicantType.student
    );
    await createOfferWith(ApprovalStatus.rejected, Secretary.extension, ApplicantType.student);
    approvedGraduadosOffer = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.graduate
    );
    await createOfferWith(ApprovalStatus.rejected, Secretary.graduados, ApplicantType.graduate);
    approvedByExtensionBothOffer = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.extension,
      ApplicantType.both
    );
    approvedByGraduadosBothOffer = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.both
    );
    approvedByGraduadosAndExtensionBothOffer = await createOfferWith(
      ApprovalStatus.approved,
      Secretary.graduados,
      ApplicantType.both
    );
    approvedByGraduadosAndExtensionBothOffer = await OfferRepository.updateApprovalStatus({
      uuid: approvedByGraduadosAndExtensionBothOffer.uuid,
      status: ApprovalStatus.approved,
      admin: await AdminGenerator.instance({ secretary: Secretary.extension })
    });
    await createOfferWith(ApprovalStatus.rejected, Secretary.graduados, ApplicantType.both);
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
        { uuid: approvedByGraduadosAndExtensionBothOffer.uuid },
        { uuid: approvedByExtensionBothOffer.uuid },
        { uuid: approvedStudentsOffer.uuid }
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
        { uuid: approvedByGraduadosAndExtensionBothOffer.uuid },
        { uuid: approvedByGraduadosBothOffer.uuid },
        { uuid: approvedGraduadosOffer.uuid }
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
        { uuid: approvedByGraduadosAndExtensionBothOffer.uuid },
        { uuid: approvedByGraduadosBothOffer.uuid },
        { uuid: approvedByExtensionBothOffer.uuid },
        { uuid: approvedGraduadosOffer.uuid },
        { uuid: approvedStudentsOffer.uuid }
      ]);
      expect(data!.getApprovedOffers.shouldFetchMore).toEqual(false);
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
            admin: await AdminGenerator.instance({ secretary: Secretary.extension }),
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
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: await AdminGenerator.instance({ secretary: Secretary.extension })
      }
    });
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns an error when the user is a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const { errors } = await apolloClient.query({ query: GET_APPROVED_OFFERS });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });
});
