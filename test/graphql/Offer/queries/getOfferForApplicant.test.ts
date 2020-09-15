import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { OfferNotFound } from "$models/Offer/Errors";
import { IApplicantCareer } from "$models/Applicant/ApplicantCareer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { OfferGenerator } from "$generators/Offer";
import { CareerGenerator } from "$generators/Career";
import { CompanyGenerator } from "$generators/Company";
import { TestClientGenerator } from "$generators/TestClient";
import { AdminGenerator } from "$generators/Admin";
import { Secretary } from "$models/Admin";

const GET_OFFER_FOR_APPLICANT = gql`
  query($uuid: ID!) {
    getOfferForApplicant(uuid: $uuid) {
      uuid
      targetApplicantType
    }
  }
`;

describe("getOfferForApplicant", () => {
  let companyUuid: string;
  let studentCareers: IApplicantCareer[];
  let graduateCareers: IApplicantCareer[];
  let studentAndGraduateCareers: IApplicantCareer[];
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();

    companyUuid = (await CompanyGenerator.instance.withCompleteData()).uuid;

    extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
    graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });

    const firstCareer = await CareerGenerator.instance();
    const secondCareer = await CareerGenerator.instance();

    studentCareers = [
      {
        careerCode: firstCareer.code,
        isGraduate: false,
        currentCareerYear: 5,
        approvedSubjectCount: 40
      }
    ];

    graduateCareers = [
      {
        careerCode: secondCareer.code,
        isGraduate: true
      }
    ];

    studentAndGraduateCareers = [
      {
        careerCode: firstCareer.code,
        isGraduate: false,
        currentCareerYear: 5,
        approvedSubjectCount: 40
      },
      {
        careerCode: secondCareer.code,
        isGraduate: true
      }
    ];
  });

  it("returns offer targeted to students for a student", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: studentCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: extensionAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forStudents({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferForApplicant.uuid).toEqual(uuid);
  });

  it("returns offer targeted to graduates for a graduate", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: graduateCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forGraduates({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferForApplicant.uuid).toEqual(uuid);
  });

  it("returns offer targeted to both for a student and graduate applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: studentAndGraduateCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferForApplicant.uuid).toEqual(uuid);
  });

  it("returns offer targeted to both for a student", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: studentCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: extensionAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferForApplicant.uuid).toEqual(uuid);
  });

  it("returns offer targeted to both for a graduate", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: graduateCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
    const { data, errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors).toBeUndefined();
    expect(data!.getOfferForApplicant.uuid).toEqual(uuid);
  });

  it("returns error if the offer is targeted to students for a graduate applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: graduateCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forStudents({ companyUuid });
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFound.name
    });
  });

  it("returns error if the offer is targeted to graduates for a student applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: studentCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const { uuid } = await OfferGenerator.instance.forGraduates({ companyUuid });
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFound.name
    });
  });

  it("returns error if the offer does not exists", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      careers: studentCareers,
      status: {
        approvalStatus: ApprovalStatus.approved,
        admin: graduadosAdmin
      }
    });
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFound.name
    });
  });

  it("returns error if there is no current user", async () => {
    const apolloClient = await client.loggedOut();
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });

  it("returns error if current user is an admin", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns error if current user is from a company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns error if current user a rejected applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.rejected,
        admin: extensionAdmin
      }
    });
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("returns error if current user a pending applicant", async () => {
    const { apolloClient } = await TestClientGenerator.applicant({
      status: {
        approvalStatus: ApprovalStatus.pending,
        admin: extensionAdmin
      }
    });
    const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const { errors } = await apolloClient.query({
      query: GET_OFFER_FOR_APPLICANT,
      variables: { uuid: randomUuid }
    });

    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });
});
