import { Database } from "../../../src/config/Database";
import { CompanyGenerator, TCompanyDataGenerator } from "../../generators/Company";
import { Company, CompanyRepository } from "../../../src/models/Company";
import { UserRepository } from "../../../src/models/User";
import { ApprovableRepository } from "../../../src/models/Approvable";
import { AdminGenerator } from "../../generators/Admin";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";
import { Admin } from "../../../src/models/Admin";

describe("ApprovableRepository", () => {
  let companiesData: TCompanyDataGenerator;
  let admin: Admin;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    companiesData = await CompanyGenerator.data.completeData();
    admin = await AdminGenerator.instance().next().value;
  });

  beforeEach(async () => {
    await CompanyRepository.truncate();
  });

  afterAll(() => Database.close());

  it("returns only pending companies", async () => {
    const rejectedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      rejectedCompany.uuid,
      ApprovalStatus.rejected
    );

    const approvedCompany = await CompanyRepository.create(companiesData.next().value);
    await CompanyRepository.updateApprovalStatus(
      admin.userUuid,
      approvedCompany.uuid,
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
