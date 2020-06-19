import Database from "../../../src/config/Database";
import { CompanyGenerator, TCompanyDataGenerator } from "../../generators/Company";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { UserRepository } from "../../../src/models/User";
import { ApprovableRepository } from "../../../src/models/Approvable";
import { AdminGenerator } from "../../generators/Admin";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";

describe("ApprovableRepository", () => {
  let companiesData: TCompanyDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    companiesData = await CompanyGenerator.data.completeData();
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  afterAll(() => Database.close());

  it("returns only pending companies", async () => {
    const admin = await AdminGenerator.instance().next().value;

    const rejectedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin,
      rejectedCompany,
      ApprovalStatus.rejected
    );

    const approvedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin,
      approvedCompany,
      ApprovalStatus.approved
    );

    const pendingCompany = await CompanyRepository.create(companiesData.next().value);

    const result = await ApprovableRepository.findPending();
    expect(result.length).toEqual(1);
    expect(result[0].uuid).toEqual(pendingCompany.uuid);
  });

  it("sorts pending companies by updatedAt", async () => {
    await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.create(companiesData.next().value);
    const [firstResult, secondResult] = await ApprovableRepository.findPending();
    expect(firstResult).toBeInstanceOf(Company);
    expect(secondResult).toBeInstanceOf(Company);
    expect(firstResult.updatedAt > secondResult.updatedAt).toBe(true);
  });
});
