import Database from "../../../src/config/Database";
import { Applicant } from "../../../src/models/Applicant/Model";
import { Career } from "../../../src/models/Career/Model";

describe("Applicant model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Applicant.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  test("create a valid applicant", async () => {
    const applicant: Applicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: "1",
      description: "Batman",
      credits: 150
    });
    const career: Career = new Career({
      code: 1,
      description: "Ingeniería Informática",
      credits: 250
    });
    applicant.careers = [ career ];
    expect(applicant).not.toBeNull();
    expect(applicant).not.toBeUndefined();
    expect(applicant.careers).not.toBeUndefined();
    expect(applicant.careers).not.toBeNull();
    expect(applicant.careers).toHaveLength(1);
  });
});
