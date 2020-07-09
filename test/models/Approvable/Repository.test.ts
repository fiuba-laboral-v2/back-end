import { Database } from "../../../src/config/Database";
import { CompanyRepository } from "../../../src/models/Company";
import { UserRepository } from "../../../src/models/User";
import {
  Approvable,
  ApprovableEntityType,
  ApprovableRepository
} from "../../../src/models/Approvable";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";
import { Admin, Applicant, Company } from "../../../src/models";

import { AdminGenerator } from "../../generators/Admin";
import { ApplicantGenerator } from "../../generators/Applicant";
import { CompanyGenerator } from "../../generators/Company";

describe("ApprovableRepository", () => {
  let admin: Admin;
  let approvedCompany: Company;
  let rejectedCompany: Company;
  let pendingCompany: Company;
  let approvedApplicant: Applicant;
  let rejectedApplicant: Applicant;
  let pendingApplicant: Applicant;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const companies = await CompanyGenerator.instance.updatedWithStatus();
    admin = await AdminGenerator.instance().next().value;
    const applicants = await ApplicantGenerator.instance.updatedWithStatus();

    rejectedCompany = await companies.next({ status: ApprovalStatus.rejected, admin }).value;
    approvedCompany = await companies.next({ status: ApprovalStatus.approved, admin }).value;
    pendingCompany = await companies.next().value;
    rejectedApplicant = await applicants.next({ status: ApprovalStatus.rejected, admin }).value;
    approvedApplicant = await applicants.next({ status: ApprovalStatus.approved, admin }).value;
    pendingApplicant = await applicants.next().value;
  });

  afterAll(() => Database.close());

  const expectToFindApprovableWithStatuses = async (
    approvables: Approvable[],
    statuses: ApprovalStatus[]
  ) => {
    const result = await ApprovableRepository.findApprovables({
      approvableEntityTypes: approvables.map(approvable => approvable.constructor.name) as any,
      statuses: statuses
    });
    expect(result).toEqual(expect.arrayContaining(
      approvables.map(approvable => expect.objectContaining(approvable.toJSON()))
    ));
  };

  it("returns an empty array if no approvableEntities are provided", async () => {
    const result = await ApprovableRepository.findApprovables({
      approvableEntityTypes: [],
      statuses: [ApprovalStatus.pending]
    });
    expect(result).toEqual([]);
  });

  it("returns only pending companies", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending]
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindApprovableWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved]
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindApprovableWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected]
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending]
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved]
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindApprovableWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected]
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindApprovableWithStatuses(
      [pendingCompany, pendingApplicant],
      [ApprovalStatus.pending]
    );
  });

  it("returns only approved and rejected applicants and companies", async () => {
    await expectToFindApprovableWithStatuses(
      [approvedCompany, rejectedCompany, approvedApplicant, rejectedApplicant],
      [ApprovalStatus.approved, ApprovalStatus.rejected]
    );
  });

  it("sorts pending applicants and companies by updatedAt in any status", async () => {
    const result = await ApprovableRepository.findApprovables({
      approvableEntityTypes: [ApprovableEntityType.Applicant, ApprovableEntityType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected]
    });
    expect(result.map(entity => entity.uuid)).toEqual([
      pendingApplicant.uuid,
      approvedApplicant.uuid,
      rejectedApplicant.uuid,
      pendingCompany.uuid,
      approvedCompany.uuid,
      rejectedCompany.uuid
    ]);
    expect(result).toBeSortedBy({ key: "updatedAt", order: "desc" });
  });
});
