import { Database } from "../../../src/config/Database";
import { CompanyGenerator, TCompanyGenerator } from "../../generators/Company";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { UserRepository } from "../../../src/models/User";
import { ApprovableRepository } from "../../../src/models/Approvable";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";
import { Admin } from "../../../src/models/Admin";

import { AdminGenerator } from "../../generators/Admin";
import { ApplicantGenerator, TApplicantGenerator } from "../../generators/Applicant";

describe("ApprovableRepository", () => {
  let companies: TCompanyGenerator;
  let applicants: TApplicantGenerator;
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    companies = await CompanyGenerator.instance.withCompleteData();
    admin = await AdminGenerator.instance().next().value;
    applicants = ApplicantGenerator.instance.withMinimumData();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await ApplicantRepository.truncate();
  });

  afterAll(() => Database.close());

  const updateCompanyWithStatus = async (status: ApprovalStatus) => {
    const { uuid: companyUuid } = await companies.next().value;
    return CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      companyUuid,
      status
    );
  };

  const updateApplicantWithStatus = async (status: ApprovalStatus) => {
    const { uuid: applicantUuid } = await applicants.next().value;
    return ApplicantRepository.updateApprovalStatus(
      admin.userUuid,
      applicantUuid,
      status
    );
  };

  it("returns only pending companies", async () => {
    await updateCompanyWithStatus(ApprovalStatus.rejected);
    await updateCompanyWithStatus(ApprovalStatus.approved);

    const pendingCompany = await companies.next().value;

    const result = await ApprovableRepository.findPending();
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toEqual(pendingCompany.uuid);
    expect(result).toEqual([expect.objectContaining(pendingCompany.toJSON())]);
  });

  it("returns only pending applicants", async () => {
    await updateApplicantWithStatus(ApprovalStatus.rejected);
    await updateApplicantWithStatus(ApprovalStatus.approved);
    const pendingApplicant = await applicants.next().value;
    const result = await ApprovableRepository.findPending();
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toEqual(pendingApplicant.uuid);
    expect(result).toEqual([expect.objectContaining(pendingApplicant.toJSON())]);
  });

  it("returns only pending applicants and companies", async () => {
    await updateApplicantWithStatus(ApprovalStatus.rejected);
    await updateApplicantWithStatus(ApprovalStatus.approved);
    await updateCompanyWithStatus(ApprovalStatus.rejected);
    await updateCompanyWithStatus(ApprovalStatus.approved);
    const pendingApplicant = await applicants.next().value;
    const pendingCompany = await companies.next().value;

    const result = await ApprovableRepository.findPending();
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining(pendingApplicant.toJSON()),
      expect.objectContaining(pendingCompany.toJSON())
    ]));
  });

  it("sorts pending companies by updatedAt", async () => {
    await companies.next().value;
    await companies.next().value;
    const [firstResult, secondResult] = await ApprovableRepository.findPending();
    expect(firstResult).toBeInstanceOf(Company);
    expect(secondResult).toBeInstanceOf(Company);
    expect(firstResult.updatedAt > secondResult.updatedAt).toBe(true);
  });

  it("sorts pending applicants by updatedAt", async () => {
    await applicants.next().value;
    await applicants.next().value;
    const [firstResult, secondResult] = await ApprovableRepository.findPending();
    expect(firstResult).toBeInstanceOf(Applicant);
    expect(secondResult).toBeInstanceOf(Applicant);
    expect(firstResult.updatedAt > secondResult.updatedAt).toBe(true);
    expect([firstResult, secondResult]).toBeSortedBy({ key: "updatedAt", descending: true });
  });

  it("sorts pending applicants and companies by updatedAt", async () => {
    const applicant1 = await applicants.next().value;
    const applicant2 = await applicants.next().value;
    const company3 = await companies.next().value;
    const company4 = await companies.next().value;

    const result = await ApprovableRepository.findPending();
    expect(result.map(entity => entity.uuid)).toEqual([
      company4.uuid,
      company3.uuid,
      applicant2.uuid,
      applicant1.uuid
    ]);
    expect(result).toBeSortedBy({ key: "updatedAt", descending: true });
  });
});
